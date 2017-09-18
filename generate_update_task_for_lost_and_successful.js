var SPLIT_UNIT = 1000;
var customerIdsWithGemsUserIds = [];
var lostSalesOrUnsuccessfulLeadIds = [];
var gemsUserIds = [];

db.person.find({$or: [{"leads.status": "LOST_SALES"}, {"leads.status": "UNSUCCESSFUL"}]}).forEach(function(person) {
	person.leads.forEach(function(lead) {
		if ((lostSalesOrUnsuccessfulLeadIds.indexOf(lead._id) <= -1) && ((lead.status === 'LOST_SALES') || (lead.status === 'UNSUCCESSFUL'))) {
			lostSalesOrUnsuccessfulLeadIds.push(lead._id);
		}
	})
})

db.person.find({$or: [{"leads.status": "LOST_SALES"}, {"leads.status": "UNSUCCESSFUL"}]}).forEach(function(person) {
	var groupedLeads = groupByOwnerSalesConsultant(person.leads);
	var groupedSalesConsultantGemsUserIds = Object.keys(groupedLeads);
	groupedSalesConsultantGemsUserIds.forEach(function(ownerSalesConsultantId) {
		var uniqueLeadStatusList = groupedLeads[ownerSalesConsultantId].map(function(lead) {return lead.status;}).filter(onlyUnique);
		var lostOrUnsuccessfulStatus = uniqueLeadStatusList.filter(function(status){return status === 'LOST_SALES' || status === 'UNSUCCESSFUL';});
		if (uniqueLeadStatusList.length === lostOrUnsuccessfulStatus.length) {
			customerIdsWithGemsUserIds.push({'customer_id':person._id.valueOf(), 'gems_user_id': ownerSalesConsultantId});
			gemsUserIds.push(ownerSalesConsultantId);
		}
	});

})

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

function groupByOwnerSalesConsultant(leads) {
	return leads.reduce(function(result, currentLead) {
		if (currentLead.ownerSalesConsultantId !== undefined) {
			result[currentLead.ownerSalesConsultantId] = result[currentLead.ownerSalesConsultantId] || [];
			result[currentLead.ownerSalesConsultantId].push(currentLead);
		}
		return result;
	}, Object.create(null));
}

function getUnitUpdateSql(leadIds) {
	return 'update otr_account.todo_task set done_time = NOW(), status = "DONE", comments = "线索失销，任务自动完成" where related_lead_id in ' + leadIds + ';';
}

function getUnitInsertSql(customerIdsGemsUserIds) {
	return 'insert into otr_customer.temp_undone_customer_task values \n' + customerIdsGemsUserIds;
}

function getBatchUpdateSql(lostSalesOrUnsuccessfulLeadIds) {
	var batchUpdateSql = '';
	var leadIdsWithBrace = '(';
	var leftLeadIdsWithBrace = '(';
	var splittedGroups = Math.floor(lostSalesOrUnsuccessfulLeadIds.length / SPLIT_UNIT);
	var leftLeadIds = lostSalesOrUnsuccessfulLeadIds.length - (SPLIT_UNIT * splittedGroups);
	var lastIndexOfGroupedLeadIds = 0;
	for (var i = 0; i < splittedGroups; i++) {
		var indexOfAThousandLeadIds = i * SPLIT_UNIT;
		lastIndexOfGroupedLeadIds = indexOfAThousandLeadIds + SPLIT_UNIT;
		var eachIds = '(';
		for (var j = indexOfAThousandLeadIds; j < lastIndexOfGroupedLeadIds ; j++) {
			eachIds = eachIds + '\'' + lostSalesOrUnsuccessfulLeadIds[j] + '\'' + ',';
		}
		batchUpdateSql = batchUpdateSql + getUnitUpdateSql(formatUpdate(eachIds)) + '\n';
	}

	if (leftLeadIds > 0) {
		for(var k = lastIndexOfGroupedLeadIds; k < lostSalesOrUnsuccessfulLeadIds.length; k++) {
			leftLeadIdsWithBrace = leftLeadIdsWithBrace + '\'' + lostSalesOrUnsuccessfulLeadIds[k] + '\'' + ',';
		}
		batchUpdateSql = batchUpdateSql + getUnitUpdateSql(formatUpdate(leftLeadIdsWithBrace)) + '\n';
	}

	return batchUpdateSql;
}

function getBatchInsertSql(customerIdsWithGemsUserIds) {
	var batchInsertSql = '';
	var leftLeadIdsWithBrace = '';
	var splittedGroups = Math.floor(customerIdsWithGemsUserIds.length / SPLIT_UNIT);
	var leftLeadIds = customerIdsWithGemsUserIds.length - (SPLIT_UNIT * splittedGroups);
	var lastIndexOfGroupedLeadIds = 0;
	for (var i = 0; i < splittedGroups; i++) {
		var indexOfAThousandLeadIds = i * SPLIT_UNIT;
		lastIndexOfGroupedLeadIds = indexOfAThousandLeadIds + SPLIT_UNIT;
		var eachIds = '';
		for (var j = indexOfAThousandLeadIds; j < lastIndexOfGroupedLeadIds ; j++) {
			eachIds = eachIds + '(' + '\'' + customerIdsWithGemsUserIds[j].customer_id + '\'' + ',' + '\'' + customerIdsWithGemsUserIds[j].gems_user_id + '\'' + ')' + ',' + '\n';
		}
		batchInsertSql = batchInsertSql + formatInsert(getUnitInsertSql(eachIds)) + '\n';
	}

	if (leftLeadIds > 0) {
		for(var k = lastIndexOfGroupedLeadIds; k < customerIdsWithGemsUserIds.length; k++) {
			leftLeadIdsWithBrace = leftLeadIdsWithBrace + '(' + '\'' + customerIdsWithGemsUserIds[k].customer_id + '\'' + ',' + '\'' + customerIdsWithGemsUserIds[k].gems_user_id + '\'' + ')' + ',' + '\n';
		}
		batchInsertSql = batchInsertSql + formatInsert(getUnitInsertSql(leftLeadIdsWithBrace)) + '\n';
	}

	return batchInsertSql;
}

function reduceGemsUserIds(total, currentString) {
	return total + currentString;
}

function mapGemsUserIds(gemsUserId) {
	return ('\'' + gemsUserId + '\'' + ',');
}

function generateGemsUserIds(gemsUserIds) {
	var reducedGemsUserId = gemsUserIds.map(mapGemsUserIds).reduce(reduceGemsUserIds);
	return '(' + formatUpdate(reducedGemsUserId);
}

function formatInsert(leadIdsWithBrace) {
	return leadIdsWithBrace.substring(0, leadIdsWithBrace.length - 2) + ';';
}

function formatUpdate(leadIdsWithBrace) {
	return leadIdsWithBrace.substring(0, leadIdsWithBrace.length - 1) + ')';

}

function createTempUndoneCustomerTaskTable() {
	return 'create table otr_customer.temp_undone_customer_task (customer_id varchar(30), gems_user_id varchar(8));';
}

function createUndoneTaskIdTable(gemsUserIds) {
	var gemsUserIdsToInsert = generateGemsUserIds(gemsUserIds);
	return 'create table otr_customer.undone_task_id as (select id from otr_customer.customer_task customer_task join (select customer_id, id user_id from otr_customer.temp_undone_customer_task temp_customer left join (select id, gems_user_id from otr_account.user where gems_user_id in ' + gemsUserIdsToInsert + ') tem_user on tem_user.gems_user_id = temp_customer.gems_user_id) undone_task on customer_task.customer_id = undone_task.customer_id and customer_task.user_id = undone_task.user_id and customer_task.task_type = "Customer follow up");';
}

function updateCustomerTaskTable() {
	return 'update otr_customer.customer_task customer_task, otr_customer.undone_task_id undone_task_id set done_time = NOW(), status = "DONE", comments = "线索失销，任务自动完成" where customer_task.id in (select id from otr_customer.undone_task_id);';
}

function dropTempUndoneCustomerTaskTable() {
	return 'drop table if exists otr_customer.temp_undone_customer_task;';
}

function dropTempUndoneTaskIdTable() {
	return 'drop table if exists otr_customer.undone_task_id;';
}

print(getBatchUpdateSql(lostSalesOrUnsuccessfulLeadIds));
print(createTempUndoneCustomerTaskTable());
print(getBatchInsertSql(customerIdsWithGemsUserIds));
print(createUndoneTaskIdTable(gemsUserIds));
print(updateCustomerTaskTable());
print(dropTempUndoneCustomerTaskTable());
print(dropTempUndoneTaskIdTable());
