var amountOfUnsuccessfulWithOwnerSalesConsultantId = 0;
db.person.find({"leads.status": "UNSUCCESSFUL"}).forEach(function(person) {
	person.leads.forEach(function(lead) {
		if (lead.status === 'UNSUCCESSFUL' && !(lead.ownerSalesConsultantId === undefined)) {
			amountOfUnsuccessfulWithOwnerSalesConsultantId += 1;
		}
	})
})
print("unsuccessful lead on PROD will be remove owner: \n" + amountOfUnsuccessfulWithOwnerSalesConsultantId);

var amountOfLostSalesWithOwnerSalesConsultantId = 0;
db.person.find({"leads.status": "LOST_SALES"}).forEach(function(person) {
	person.leads.forEach(function(lead) {
		if (lead.status === 'LOST_SALES' && !(lead.ownerSalesConsultantId === undefined)) {
			amountOfLostSalesWithOwnerSalesConsultantId += 1;
		}
	})
})
print("lost sales lead on PROD will be remove owner: \n" + amountOfLostSalesWithOwnerSalesConsultantId);

var amountOfLostSalesLeadIds = 0;
db.person.find({"leads.status": "LOST_SALES"}).forEach(function(person) {
	person.leads.forEach(function(lead) {
		if (lead.status === 'LOST_SALES') {
			amountOfLostSalesLeadIds += 1;
		}
	})
})
print("total amount of lost sales lead is: \n" + amountOfLostSalesLeadIds);

var amountOfUnsuccessfulLeadIds = 0;
db.person.find({"leads.status": "UNSUCCESSFUL"}).forEach(function(person) {
	person.leads.forEach(function(lead) {
		if (lead.status === 'UNSUCCESSFUL') {
			amountOfUnsuccessfulLeadIds += 1;
		}
	})
})
print("total amount of unsuccessful lead is: \n" + amountOfUnsuccessfulLeadIds);

var amountOfUnsuccessfulLeadWithLostSalesActivity = 0;
db.person.find({"leads.status": "UNSUCCESSFUL"}).forEach(function(person) {
	person.leads.forEach(function(lead) {
		if (lead.status === 'UNSUCCESSFUL') {
			lead.activities.forEach(function(activity) {
				if (activity.activityType === 'LOST_SALES') {
					amountOfUnsuccessfulLeadWithLostSalesActivity += 1;
				}
			})
		}
	})
})
print("total amount of unsuccessful lead with lost sales activity is: \n" + amountOfUnsuccessfulLeadWithLostSalesActivity);

var amountOfUnsuccessfulOrLostSalesLeadIds = 0;
db.person.find({$or: [{"leads.status": "UNSUCCESSFUL"}, {"leads.status": "LOST_SALES"}]}).forEach(function(person) {
	person.leads.forEach(function(lead) {
		if (lead.status === 'UNSUCCESSFUL' || lead.status === 'LOST_SALES') {
			amountOfUnsuccessfulOrLostSalesLeadIds += 1;
		}
	})
})
print("total amount of lost sales and unsuccessful lead is: \n" + amountOfUnsuccessfulOrLostSalesLeadIds);
