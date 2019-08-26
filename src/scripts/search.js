const initSearch = () => {
	document.querySelector("#search-domain").addEventListener("submit", function(e) {
		e.preventDefault()
		e.stopImmediatePropagation()

		let domSearch = document.querySelector("#search-domain input[type=text]")
		let domSubmit = document.querySelector("#search-domain input[type=submit]")
		let domSearchLoading = document.querySelector("#search .search-loading")
		let domResults = document.querySelector("#search .search-results")
		let domResultsLines = document.querySelector("#search .search-results .lines")

		if (domSubmit.classList.contains('loading')) {
			return false
		}

		domSubmit.classList.add('loading')
		domSearchLoading.classList.add('show')
		
		domResults.classList.remove('show')
		domResultsLines.innerHTML = ""

		request = new Request()
		request.done = (response) => {
			domSubmit.classList.remove('loading')
			domSearchLoading.classList.remove('show')

			if (response.getErr() == null) {
				for (let i = 0, iL = response.result.domains.length; i < iL; i++) {
					domain = response.result.domains[i]

					let domLine = document.createElement("div")
					domLine.classList.add("line")

					let domDomain = document.createElement("div")
					domDomain.innerHTML = domain.domain
					domDomain.classList.add("domain")
					domLine.appendChild(domDomain)
					
					if (domain.available) {
						let domAvailable = document.createElement("div")
						domAvailable.classList.add("available")

						let domAvailableButton = document.createElement("input")
						domAvailableButton.type = "button"
						domAvailableButton.classList.add("btn-success")
						domAvailableButton.value = "Buy"
						domAvailableButton.dataset.domain = domain.domain
						domAvailableButton.addEventListener("click", (e) => {
							initBuyDomain(e.target.dataset.domain)
						})
						domAvailable.appendChild(domAvailableButton)

						domLine.appendChild(domAvailable)
					} else {
						let domNotAvailable = document.createElement("div")
						domNotAvailable.innerHTML = "Not available"
						domNotAvailable.classList.add("not-available")
						domLine.appendChild(domNotAvailable)
					}

					domResultsLines.appendChild(domLine)
				}
				domResults.classList.add('show')
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
		request.get("/available-domains", {"search": domSearch.value}, mainURL)

		return false
	})
}

const initBuyDomain = (domainName) => {
	let content = document.querySelector("#buy-domain")
	let contentCopy = content.innerHTML
	let closeBuyDomain = (contentCopy) => {
		// Destroy all the event listener and return to the default HTML configuration
		document.querySelector("#buy-domain").innerHTML = contentCopy
		document.querySelector("#buy-domain").classList.add('hide')
	}

	content.classList.remove('hide')

	// reload the dom to show all the elements
	setTimeout(() => {
		domContactsItems = content.querySelector(".contacts .items")
		

		requestContactList = new Request()
		requestContactList.done = (response) => {
			contacts = {
				0: {
					id: 0,
					name: "New contact"
				}
			}

			for (let i = 0, iL = response.getResult().contacts.length; i < iL; i++) {
				let contact = response.getResult().contacts[i].contact
				contacts[contact.id] = contact
			}

			for (i in contacts) {
				contact = contacts[i]

				let domItem = document.createElement("div")
				domItem.classList.add("item")

				let domFormContact = document.createElement("label")
				domFormContact.setAttribute("for", "form-contact-"+contact.id)
				if (contact.id === 0) {
					domFormContact.innerHTML = contact.name
				} else {
					domFormContact.innerHTML = contact.firstname+" "+contact.lastname+"<br />"+contact.email
				}
				domItem.appendChild(domFormContact)

				let domInput = document.createElement("input")
				domInput.id = "form-contact-"+contact.id
				domInput.type = "radio"
				domInput.name = "contact_id"
				domInput.value = contact.id
				domInput.addEventListener("change", chooseContact)
				if (contact.id === 0) {
					domInput.checked = true
				}
				domItem.appendChild(domInput)

				domContactsItems.appendChild(domItem)
			}

			/*
			domSubmit.classList.remove('loading')

			if (response.getErr() == null) {
				closeBuyDomain(contentCopy)

				document.querySelectorAll(".tab-head-main li")[0].dispatchEvent(new Event("click")) // Go to the domain lists
			} else {
				Toastify({
					text: "Error: "+response.getErr(),
					duration: 5000,
					gravity: "top",
					position: "right",
					backgroundColor: "rgb(239, 87, 116)",
				}).showToast()
				
			}
			*/
		}
		requestContactList.get("/contacts")


		let domSubmit = content.querySelector("input[type=submit]")

		// Get user organizations
		organizationsRequest = new Request()
		organizationsRequest.done = (response) => {
			if (response.getErr() == null) {
				if (response.getResult()["organizations"].length == 0) {
					Toastify({
						text: "You don't have any organizations, please contact us",
						duration: 5000,
						gravity: "top",
						position: "right",
						backgroundColor: "rgb(239, 87, 116)",
					}).showToast()
					setTimeout(() => {
						localStorage.removeItem('token')
						document.location.reload()
					}, 5000)
				}
				content.querySelector("input[name='organization_id']").value = response.getResult()["organizations"][0].id
			} else if (response.getErr() == errTokenInvalid) {
				localStorage.removeItem('token')
				document.location.reload()
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
		organizationsRequest.get("/organizations", null, accountURL)

		// Legal form restricted fields
		let funcChangeLegalForm = (e) => {
			e.preventDefault()
			e.stopImmediatePropagation()

			legelFormHide = content.querySelectorAll(".no-legal_form")
			for (let i = 0, iL = legelFormHide.length; i < iL; i++) {
				if (legelFormHide[i].classList.contains("no-legal_form-"+e.target.value)) {
					legelFormHide[i].classList.add("hide")
				} else {
					legelFormHide[i].classList.remove("hide")
				}
			}
		}
		let domLegalsForm = content.querySelectorAll("[name=contact-legal_form]")
		for (let i = 0, iL = domLegalsForm.length; i < iL; i++) {
			domLegalsForm[i].addEventListener("change", funcChangeLegalForm)
			if (domLegalsForm[i].checked) {
				domLegalsForm[i].dispatchEvent(new Event("change"))
			}
		}

		// Extension FR restricted fields
		content.querySelector("#form-extension_fr-mode").addEventListener("change", (e) => {
			afnicControlModes = content.querySelectorAll(".afnic-control-mode")
			for (let i = 0, iL = afnicControlModes.length; i < iL; i++) {
				if (afnicControlModes[i].classList.contains("mode-"+e.target.value)) {
					afnicControlModes[i].classList.remove("hide")
					break
				} else {
					afnicControlModes[i].classList.add("hide")
				}
			}
		})
		content.querySelector("#form-extension_fr-mode").dispatchEvent(new Event("change"))

		// Period text
		content.querySelector("#form-period").addEventListener("change", (e) => {
			textPeriod = content.querySelectorAll(".text-period")
			for (let i = 0, iL = textPeriod.length; i < iL; i++) {
				textPeriod[i].innerHTML = e.target.value
			}
		})
		content.querySelector("#form-period").dispatchEvent(new Event("change"))

		// Domain text
		textDomain = content.querySelectorAll(".text-domain")
		for (let i = 0, iL = textDomain.length; i < iL; i++) {
			textDomain[i].innerHTML = domainName
		}
		content.querySelector("input[name='domain']").value = domainName

		// Back
		content.querySelector(".back").addEventListener("click", (e) => {
			e.preventDefault()
			e.stopPropagation()

			closeBuyDomain(contentCopy)
		})

		// Submit form
		content.addEventListener("submit", (e) => {
			e.preventDefault()
			e.stopImmediatePropagation()
			
			if (domSubmit.classList.contains("loading")) {
				return false
			}
			domSubmit.classList.add("loading")

			let paramsFill = (params, key, val) => {
				keys = key.split("-")

				if (keys.length == 1) {
					if (val == "") {
						return params
					} else if (!isNaN(val) && key != "zip" && key != "phone_number" && key != "fax_number") {
						params[key] = parseInt(val)
					} else if (val == "true") {
						params[key] = true
					} else if (val == "false") {
						params[key] = false
					} else {
						params[key] = val
					}
					return params
				} else {
					if (params[keys[0]] === undefined) {
						params[keys[0]] = {}
					}
					params[keys[0]] = paramsFill(params[keys[0]], key.substring(keys[0].length + 1), val)
					if (params[keys[0]] == {}) {
						params[keys[0]] = null
					}
				}

				return params
			}

			var formData = new FormData(e.target)
			params = {}
			formData.forEach((val, key) => {
				params = paramsFill(params, key, val)
			})

			// Handle contact 
			if (parseInt(params.contact_id) === 0) { // New contact
				delete params.contact_id
			} else { // Old contact
				delete params.contact
			}

			request = new Request()
			request.done = (response) => {
				domSubmit.classList.remove('loading')

				if (response.getErr() == null) {
					closeBuyDomain(contentCopy)

					document.querySelectorAll(".tab-head-main li")[0].dispatchEvent(new Event("click")) // Go to the domain lists
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
			request.post("/domains", params)

			return false
		})
	}, 0)
}

const chooseContact = (e) => {
	e.preventDefault()
	e.stopPropagation()

	if (e.target.value == 0) {
		document.querySelector(".new-contact").classList.remove("hide")
	} else {
		document.querySelector(".new-contact").classList.add("hide")
	}
}