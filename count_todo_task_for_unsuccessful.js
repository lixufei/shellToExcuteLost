var lostSalesOrUnsuccessfulLeadIds = [];
db.person.find({"leads.status": "UNSUCCESSFUL"}).forEach(function(person) {
	person.leads.forEach(function(lead) {
		if ((lostSalesOrUnsuccessfulLeadIds.indexOf(lead._id) <= -1) && (lead.status === 'UNSUCCESSFUL')) {
			lostSalesOrUnsuccessfulLeadIds.push(lead._id);
		}
	})
})

function generateSelectLeadTaskToBeDone(leadIds) {
	return 'SELECT user_id, related_lead_id, status, done_time, comments from otr_account.todo_task where related_lead_id in ' + leadIds;
}

function generateLeadIdWithBrace(leadIds) {
	var leadIdHeader = '(';
	var leadIdWithQuote = leadIds.map(function(leadId) {
		return ('"' + leadId + '"' + ',');
	});
	var concatLeadIdWithQuote = leadIdWithQuote.reduce(function(result, currentLeadId) {
		return result + currentLeadId;
	});
	return leadIdHeader + formatSelect(concatLeadIdWithQuote);
}

function formatSelect(leadIdsWithBrace) {
	return leadIdsWithBrace.substring(0, leadIdsWithBrace.length - 1) + ')';

}

print(generateSelectLeadTaskToBeDone(generateLeadIdWithBrace(lostSalesOrUnsuccessfulLeadIds)));