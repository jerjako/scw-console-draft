const recordTypes = [
	"A",
	"AAAA",
	"CNAME",
	"TXT",
	"SRV",
	"TLSA",
	"MX",
	"NS",
	"PTR",
	"CAA",
	"FUNC_URLUP_A",
	"FUNC_URLUP_AAAA",
	"FUNCTION"
]

let updateZoneChanges = []
let contentEditRecordsCopy = null
let domEditRecordsSave = null
const initEditZone = (domainName, subdomainName) => {
	const pageSize = 20
	let pageActive = 1

	updateZoneChanges = []
	zoneName = domainName
	if (subdomainName != "") {
		zoneName = subdomainName+"."+domainName
	}

	let content = document.querySelector("#edit-zone")
	
	// reset the dom after the first view
	if (contentEditRecordsCopy == null) {
		contentEditRecordsCopy = content.innerHTML
	} else {
		content.innerHTML = contentEditRecordsCopy
	}
	
	let domEditRecords = content.querySelector("#edit-records")
	let domEditRecordsLoading = domEditRecords.querySelector(".loading")
	let domEditRecordsContent = domEditRecords.querySelector(".content")
	let domEditRecordsEmpty = domEditRecords.querySelector(".empty")
	domEditRecordsSave = content.querySelector(".save-zone")
	let domEditRecordsAdd = content.querySelector(".add")
	let domPagination = content.querySelector(".pagination")

	domEditRecordsLoading.classList.remove("hide")
	domEditRecordsEmpty.classList.add("hide")
	domEditRecordsContent.classList.add("hide")
	domEditRecordsSave.classList.add("hide")

	const generatePagination = (cnt) => {
		domPagination.innerHTML = ''

		for (var i = 0, iL = Math.ceil(cnt/pageSize); i < iL; i++) {
			page = i+1

			li = document.createElement('li')
			li.classList.add('page-item')
			li.innerHTML = page
			li.dataset.page = page
			if (page == pageActive) {
				li.classList.add('disabled')
			} else {
				li.addEventListener('click', (e) => {
					getRecordsByPage(parseInt(e.target.dataset.page))
				})
			}

			domPagination.append(li)
		}
	}

	// Zone name
	textZone = content.querySelectorAll(".text-zone")
	for (let i = 0, iL = textZone.length; i < iL; i++) {
		textZone[i].innerHTML = zoneName
	}

	let close = () => {
		content.classList.add('hide')
	}

	// Back
	content.querySelector(".back").addEventListener("click", (e) => {
		e.preventDefault()
		e.stopPropagation()

		close()
	})

	// Save the zone
	domEditRecordsSave.dataset.zone = zoneName
	domEditRecordsSave.dataset.domainName = domainName
	domEditRecordsSave.dataset.subdomainName = subdomainName
	domEditRecordsSave.addEventListener("click", (e) => {
		e.preventDefault()
		e.stopPropagation()

		// Send the update for the zone
		params = {
			"return_all_records": false,
			"changes": updateZoneChanges
		}

		let zoneName = e.target.dataset.zone
		
		request = new Request()
		request.done = (response) => {
			if (response.getErr() == null) {
				initEditZone(e.target.dataset.domainName, e.target.dataset.subdomainName)
				Toastify({
					text: "Zone updated",
					duration: 5000,
					gravity: "top",
					position: "right",
					backgroundColor: "rgb(69, 214, 181)",
				}).showToast()
			} else {
				updateZoneChanges = []
				domEditRecordsSave.classList.add("hide")
				Toastify({
					text: "Error: "+response.getErr(),
					duration: 5000,
					gravity: "top",
					position: "right",
					backgroundColor: "rgb(239, 87, 116)",
				}).showToast()
			}
		}
		request.patch("/dns-zones/"+zoneName+"/records", params)
	})

	// Add a record
	domEditRecordsAdd.addEventListener("submit", (e) => {
		e.preventDefault()
		e.stopPropagation()

		domAdd = content.querySelector(".add")

		if (domAdd.querySelector("input[name='data']").value == "") {
			Toastify({
				text: "Data is required",
				duration: 5000,
				gravity: "top",
				position: "right",
				backgroundColor: "rgb(239, 87, 116)",
			}).showToast()

			return false
		}

		record = {
			"name": domAdd.querySelector("input[name='name']").value,
			"type": domAdd.querySelector("select[name='type']").value,
			"data": domAdd.querySelector("input[name='data']").value,
		}

		if (domAdd.querySelector("input[name='priority']").value != "") {
			record.priority = domAdd.querySelector("input[name='priority']").value
		}
		if (domAdd.querySelector("input[name='ttl']").value != "") {
			record.ttl = domAdd.querySelector("input[name='ttl']").value
		}

		updateZoneChanges.push({
			"add": {
				"records": [
					record
				]
			}
		})
		domEditRecordsSave.dispatchEvent(new Event("click"))
	})


	const getRecordsByPage = (page) => {
		pageActive = page

		content.classList.remove('hide')
		domEditRecords.classList.remove('hide')

		request = new Request()
		request.done = (response) => {
			if (response.getErr() == null) {
				records = response.getResult().records

				if (records.length > 0) {
					let domResultsLines = domEditRecordsContent.querySelector(".lines")
					domResultsLines.innerHTML = ""
					for (let i = 0, iL = records.length; i < iL; i++) {
						record = records[i]

						let domLine = document.createElement("div")
						domLine.classList.add("line")

						let domName = document.createElement("div")
						domName.classList.add("name")

						domNameInput = document.createElement("input")
						domNameInput.type = "text"
						domNameInput.name = "name"
						domNameInput.dataset.value = record.name
						domNameInput.value = record.name
						domNameInput.placeholder = "Empty name"
						domNameInput.addEventListener("change", editRecord)
						domName.appendChild(domNameInput)

						domLine.appendChild(domName)

						let domType = document.createElement("div")
						domType.classList.add("type")

						let domTypeSelect = document.createElement("select")
						domTypeSelect.name = "type"
						domTypeSelect.dataset.value = record.type
						domTypeSelect.addEventListener("change", editRecord)
						for (let i = 0, iL = recordTypes.length; i < iL; i++) {
							let domTypeOption = document.createElement("option")
							domTypeOption.value = recordTypes[i]
							domTypeOption.text = recordTypes[i]
							if (record.type == recordTypes[i]) {
								domTypeOption.selected = true
							}
							domTypeSelect.appendChild(domTypeOption)
						}
						domType.appendChild(domTypeSelect)
						domLine.appendChild(domType)

						let domData = document.createElement("div")
						domData.classList.add("data")

						domDataInput = document.createElement("input")
						domDataInput.type = "text"
						domDataInput.name = "data"
						domDataInput.dataset.value = record.data
						domDataInput.value = record.data
						domDataInput.addEventListener("change", editRecord)
						domData.appendChild(domDataInput)

						domLine.appendChild(domData)

						let domPriority = document.createElement("div")
						domPriority.classList.add("priority")

						domPriorityInput = document.createElement("input")
						domPriorityInput.type = "text"
						domPriorityInput.name = "priority"
						domPriorityInput.dataset.value = record.priority
						domPriorityInput.value = record.priority
						domPriorityInput.addEventListener("change", editRecord)
						domPriority.appendChild(domPriorityInput)

						domLine.appendChild(domPriority)

						let domTTL = document.createElement("div")
						domTTL.classList.add("ttl")

						domTTLInput = document.createElement("input")
						domTTLInput.type = "text"
						domTTLInput.name = "ttl"
						domTTLInput.dataset.value = record.ttl
						domTTLInput.value = record.ttl
						domTTLInput.addEventListener("change", editRecord)
						domTTL.appendChild(domTTLInput)

						domLine.appendChild(domTTL)

						let domAction = document.createElement("div")
						domAction.classList.add("action")

						let domActionDel = document.createElement("input")
						domActionDel.type = "button"
						domActionDel.value = "Delete"
						domActionDel.dataset.zone = zoneName
						domActionDel.dataset.name = record.name
						domActionDel.dataset.type = record.type
						domActionDel.dataset.data = record.data
						domActionDel.classList.add("btn-error")
						domAction.appendChild(domActionDel)
						domAction.addEventListener("click", (e) => {
							updateZoneChanges.push({
								"delete": {
									"name": e.target.dataset.name,
									"type": e.target.dataset.type,
									"data": e.target.dataset.data
								}
							})
							e.target.parentElement.parentElement.remove()
							domEditRecordsSave.classList.remove("hide")

							return false
						})
						domLine.appendChild(domAction)

						domResultsLines.appendChild(domLine)
					}

					generatePagination(response.getResult().total_count)

					domEditRecordsLoading.classList.add("hide")
					domEditRecordsContent.classList.remove("hide")
					domEditRecordsEmpty.classList.add("hide")
				} else {
					domEditRecordsLoading.classList.add("hide")
					domEditRecordsContent.classList.remove("hide")
					domEditRecordsEmpty.classList.remove("hide")
				}


			} else {
				Toastify({
					text: "Error: "+response.getErr(),
					duration: 5000,
					gravity: "top",
					position: "right",
					backgroundColor: "rgb(239, 87, 116)",
				}).showToast()
			}
		}
		request.get("/dns-zones/"+zoneName+"/records", {
			"page": page,
			"page_size": pageSize
		})
	}
	getRecordsByPage(1)
}

const focusRecord = (e) => {
	if (!e.target.dataset.ready) {
		e.target.dataset.value = e.target.value
		e.target.dataset.ready = true
	}
}

const editRecord = (e) => {
	let line = e.target.parentElement.parentElement

	let domName = line.querySelector("[name='name']")
	let domType = line.querySelector("[name='type']")
	let domData = line.querySelector("[name='data']")
	let domPriority = line.querySelector("[name='priority']")
	let domTtl = line.querySelector("[name='ttl']")

	record = {
		"name": domName.value,
		"type": domType.value,
		"data": domData.value,
		"priority": domPriority.value,
		"ttl": domTtl.value,
	}

	updateZoneChanges.push({
		"set": {
			"name": domName.dataset.value,
			"type": domType.dataset.value,
			"data": domData.dataset.value,
			"records": [record]
		}
	})

	domEditRecordsSave.classList.remove("hide")
}