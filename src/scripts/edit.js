var editDomain
const initEdit = (domainName) => {
	editDomain = domainName
	
	let content = document.querySelector("#edit-domain")
	let contentCopy = content.innerHTML
	let close = (contentCopy) => {
		// Destroy all the event listener and return to the default HTML configuration
		document.querySelector("#edit-domain").innerHTML = contentCopy
		document.querySelector("#edit-domain").classList.add('hide')
	}

	content.classList.remove('hide')
	// reload the dom to show all the elements
	setTimeout(() => {
		// Init tabs
		initTabs(content.querySelectorAll(".tab-head > li"), content.querySelectorAll(".tab-body > div"))

		// Back
		content.querySelector(".back").addEventListener("click", (e) => {
			e.preventDefault()
			e.stopPropagation()

			close(contentCopy)
		})

		// Domain text
		textDomain = content.querySelectorAll(".text-domain")
		for (let i = 0, iL = textDomain.length; i < iL; i++) {
			textDomain[i].innerHTML = domainName
		}
	}, 0)
}

const initDomainOverview = () => {
	let content = document.querySelector("#edit-domain")
	let domEditOverview = content.querySelector("#edit-overview")
	let domEditOverviewLoading = domEditOverview.querySelector(".loading")
	let domEditOverviewContent = domEditOverview.querySelector(".content")

	domEditOverviewLoading.classList.remove("hide")
	domEditOverviewContent.classList.add("hide")

	request = new Request()
	request.done = (response) => {
		domEditOverviewLoading.classList.add("hide")
		domEditOverviewContent.classList.remove("hide")

		if (response.getErr() == null) {
			domain = response.getResult().domain

			// Domain status
			textStatus = content.querySelectorAll(".text-status")
			for (let i = 0, iL = textStatus.length; i < iL; i++) {
				textStatus[i].innerHTML = domain.status
				textStatus[i].classList.add(domain.status)
			}

			// Domain status
			textType = content.querySelectorAll(".text-type")
			for (let i = 0, iL = textType.length; i < iL; i++) {
				if (domain.is_external) {
					textType[i].innerHTML = "External"
				} else {
					textType[i].innerHTML = "Internal"
				}
			}

			// Domain locked
			textLocked = content.querySelectorAll(".text-locked")
			for (let i = 0, iL = textLocked.length; i < iL; i++) {
				textLocked[i].innerHTML = (isLocked(domain.epp) ? "<img src='images/locked.svg'/>":  "<img src='images/unlocked.svg'/>")
			}

			// Domain DNSSEC
			textDNSSEC = content.querySelectorAll(".text-dnssec")
			for (let i = 0, iL = textDNSSEC.length; i < iL; i++) {
				textDNSSEC[i].innerHTML = domain.dnssec_status
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
	request.get("/domains/"+editDomain)

	// Nameservers
	requestNS = new Request()
	requestNS.done = (response) => {
		if (response.getErr() == null) {
			ns = response.getResult().ns

			nsText = []
			for (let i = 0, iL = ns.length; i < iL; i++) {
				if (ns[i].ip.length > 0) {
					nsText.push(ns[i].name+" ("+ns[i].ip.join(",")+")")
				} else {
					nsText.push(ns[i].name)
				}
			}
			if (nsText.length == 0) {
				nsText = "-"
			} else {
				nsText = nsText.join(" / ")
			}

			textNS = content.querySelectorAll(".text-ns")
			for (let i = 0, iL = textNS.length; i < iL; i++) {
				textNS[i].innerHTML = nsText
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
	requestNS.get("/dns-zones/"+editDomain+"/nameservers")
}

let contentEditZonesCopy = null
const initDomainZones = () => {
	let content = document.querySelector("#edit-domain")
	let domEditZones = content.querySelector("#edit-zones")

	// reset the dom after the first view
	if (contentEditZonesCopy == null) {
		contentEditZonesCopy = domEditZones.innerHTML
	} else {
		domEditZones.innerHTML = contentEditZonesCopy
	}

	let domEditZonesLoading = domEditZones.querySelector(".loading")
	let domEditZonesContent = domEditZones.querySelector(".content")

	domEditZonesLoading.classList.remove("hide")
	domEditZonesContent.classList.add("hide")

	request = new Request()
	request.done = (response) => {
		domEditZonesLoading.classList.add("hide")
		domEditZonesContent.classList.remove("hide")

		let domResultsLines = content.querySelector(".results")

		if (response.getErr() == null) {
			result = response.getResult()

			for (let i = 0, iL = result.dns_zones.length; i < iL; i++) {
				zone = result.dns_zones[i]

				let domLine = document.createElement("div")
				domLine.classList.add("line")

				let domName = document.createElement("div")
				if (zone.subdomain == "") {
					domName.innerHTML = "<i>root zone</i>"
				} else {
					domName.innerHTML = zone.subdomain
				}
				domName.classList.add("zone")
				domLine.appendChild(domName)
				
				let domAction = document.createElement("div")
				domAction.classList.add("action")

				let domActionEdit = document.createElement("input")
				domActionEdit.type = "button"
				domActionEdit.value = "Edit"
				domActionEdit.dataset.domain = zone.domain
				domActionEdit.dataset.subdomain = zone.subdomain
				domActionEdit.classList.add("btn-success")
				domAction.appendChild(domActionEdit)
				domAction.addEventListener("click", (e) => {
					e.preventDefault()
					e.stopPropagation()

					initEditZone(e.target.dataset.domain, e.target.dataset.subdomain)

					return false
				})
				domLine.appendChild(domAction)

				domResultsLines.appendChild(domLine)
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
	request.get("/domains/"+editDomain+"/dns-zones", {
		"order_by": "subdomain_asc"
	})

}