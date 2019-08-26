const initTabs = (tabHeads, tabBodies) => {
	let tabActive = -1
	let funcLiClick = function(e) {
		e.preventDefault()
		e.stopPropagation()

		pos = parseInt(e.target.dataset.pos)
		if (pos == tabActive) {
			return false
		}

		if (tabActive >= 0) {
			tabHeads[tabActive].classList.remove("active")
			tabBodies[tabActive].classList.remove("active")
			tabBodies[tabActive].classList.add("hide")
		}

		tabActive = pos

		tabHeads[tabActive].classList.add("active")
		tabBodies[tabActive].classList.add("active")
		tabBodies[tabActive].classList.remove("hide")

		if (tabHeads[tabActive].dataset && tabHeads[tabActive].dataset.load) {
			switch (tabHeads[tabActive].dataset.load) {
				case "domainList":
					initList()
					break;
				case "domainSearch":
					initSearch()
					break;
				case "domainOverview":
					initDomainOverview()
					break;
				case "domainZones":
					initDomainZones()
					break;
			}
		}

		return false
	}

	if (tabHeads.length != tabBodies.length) {
		Toastify({
			text: "Unknown error",
			duration: 3000,
			gravity: "top",
			position: "right",
			backgroundColor: "rgb(239, 87, 116)",
		}).showToast()
		return false
	}
	for (let i = 0, iL = tabHeads.length; i < iL; i++) {
		if (i == 0) {
			tabHeads[i].classList.add("active")
			tabBodies[i].classList.add("active")
		} else {
			tabBodies[i].classList.add("hide")
		}
		tabHeads[i].dataset.pos = i
		tabHeads[i].addEventListener("click", funcLiClick)
	}

	// init the first click
	tabHeads[0].dispatchEvent(new Event("click"))
}