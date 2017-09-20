var customerIdsWithGemsUserIds = [];
var lostSalesOrUnsuccessfulLeadIds = [];
var gemsUserIds = [];

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

function generateSelectCustomerTask(gemsUserIdsWithBrace, conditionAfterWhere) {
	return 'select * from (select gems_user_id, customer_id, task_type, status, done_time, comments from otr_customer.customer_task task join (select id, gems_user_id from otr_account.user u where u.gems_user_id in ' + gemsUserIdsWithBrace + ') user_id on user_id.id = task.user_id) customer_user where ' +
		conditionAfterWhere + ' and customer_user.task_type="Customer follow up";';
}

function generateConditionAfterWhere(customerIdsWithGemsUserIds) {
	var header = '(';
	var ending = ')';
	var mappedIdWithGemsUserId = customerIdsWithGemsUserIds.map(function(idWithGemsUserId) {
		return ('(customer_user.customer_id="' + idWithGemsUserId.customer_id + '" and customer_user.gems_user_id=' + '"' + idWithGemsUserId.gems_user_id + '"' + ') or ');
	});
	var reducedIdWithGemsUserId = mappedIdWithGemsUserId.reduce(function(result, currentIdWithGemsUserId) {
		return result + currentIdWithGemsUserId;
	}, '');
	var substringReduceIdWithGemsUserId = reducedIdWithGemsUserId.substring(0, reducedIdWithGemsUserId.length - 4);
	return header + substringReduceIdWithGemsUserId + ending;
}

function generateGemsUserIdWithBrace(gemsUserId) {
	var header = '(';
	var idWithQuote = gemsUserId.map(function(gemsUserId) {
		return ('"' + gemsUserId + '"' + ',');
	});
	var concatGemsUserIdWithQuote = idWithQuote.reduce(function(result, currentId) {
		return result + currentId;
	}, '');
	return header + formatSelect(concatGemsUserIdWithQuote);
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

function formatSelect(leadIdsWithBrace) {
	return leadIdsWithBrace.substring(0, leadIdsWithBrace.length - 1) + ')';

}

print(generateSelectCustomerTask(generateGemsUserIdWithBrace(gemsUserIds), generateConditionAfterWhere(customerIdsWithGemsUserIds)));
