var unsuccessfulLeadWithOwner = 0;
db.person.find({"leads.status": "UNSUCCESSFUL"}).forEach(function(person) {
	person.leads.forEach(function(lead) {
		if (lead.status === 'UNSUCCESSFUL' && !(lead.ownerSalesConsultantId === undefined)) {
			unsuccessfulLeadWithOwner += 1;
			delete lead.ownerSalesConsultantId;
			db.person.update({"leads._id": lead._id}, person);
		}
	})
})
print("amount of removed unsuccessfulLeadWithOwner is: \n" + unsuccessfulLeadWithOwner);

var lostLeadWithOwner = 0;
db.person.find({"leads.status": "LOST_SALES"}).forEach(function(person) {
	person.leads.forEach(function(lead) {
		if (lead.status === 'LOST_SALES' && !(lead.ownerSalesConsultantId === undefined)) {
			lostLeadWithOwner += 1;
			delete lead.ownerSalesConsultantId;
			db.person.update({"leads._id": lead._id}, person);
		}
	})
})
print("amount of removed lostLeadWithOwner is: \n" + lostLeadWithOwner);
