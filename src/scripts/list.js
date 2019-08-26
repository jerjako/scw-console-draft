var domResultsOrigin = null

const initList = () => {
	const pageSize = 20
	let pageActive = 1

	let list = document.querySelector(".tab-body-main #list")
	let domLoading = list.querySelector(".loading")
	let domResults = list.querySelector(".results")
	let domEmpty = list.querySelector(".empty")
	let domPagination = domResults.querySelector(".pagination")
	if (domResultsOrigin == null) {
		domResultsOrigin = domResults.innerHTML
	}

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
					getDomainByPage(parseInt(e.target.dataset.page))
				})
			}

			domPagination.append(li)
		}
	}

	const getDomainByPage = (page) => {
		pageActive = page

		domLoading.classList.remove("hide")
		domResults.classList.add("hide")
		domEmpty.classList.add("hide")

		request = new Request()
		request.done = (response) => {
			domResults.innerHTML = domResultsOrigin
			domPagination = domResults.querySelector(".pagination")

			if (response.getErr() == null) {
				if (response.result.domains.length > 0) {
					let domResultsLines = domResults.querySelector(".lines")
					for (let i = 0, iL = response.result.domains.length; i < iL; i++) {
						domain = response.result.domains[i]

						let domLine = document.createElement("div")
						domLine.classList.add("line")

						let domDomain = document.createElement("div")
						domDomain.innerHTML = domain.domain
						domDomain.classList.add("domain")
						domLine.appendChild(domDomain)
						
						let domType = document.createElement("div")
						if (domain.is_external) {
							domType.innerHTML = "External"
						} else {
							domType.innerHTML = "Internal"
						}
						domType.classList.add("type")
						domLine.appendChild(domType)

						let domExpiration = document.createElement("div")
						if (domain.expired_at) {
							let d = new Date(domain.expired_at)
							domExpiration.innerHTML = d.getFullYear()+"/"+("0" + (d.getMonth()+1)).slice(-2)+"/"+("0" + d.getDate()).slice(-2)
						} else {
							domExpiration.innerHTML = "-"
						}
						domExpiration.classList.add("expiration")
						domLine.appendChild(domExpiration)

						let domAutorenew = document.createElement("div")
						if (domain.autorenew) {
							domAutorenew.innerHTML = "Yes"
						} else {
							domAutorenew.innerHTML = "No"
						}
						domAutorenew.classList.add("autorenew")
						domLine.appendChild(domAutorenew)

						let domLocked = document.createElement("div")
						if (isLocked(domain.epp)) {
							domLocked.innerHTML = "<img src='images/locked.svg'/>"
						} else {
							domLocked.innerHTML = "<img src='images/unlocked.svg'/>"
						}
						domLocked.classList.add("locked")
						domLine.appendChild(domLocked)

						if (domain.status == "active") {
							let domAction = document.createElement("div")
							domAction.classList.add("action")

							let domActionEdit = document.createElement("input")
							domActionEdit.type = "button"
							domActionEdit.value = "Edit"
							domActionEdit.dataset.domain = domain.domain
							domActionEdit.classList.add("btn-success")
							domAction.appendChild(domActionEdit)
							domAction.addEventListener("click", (e) => {
								e.preventDefault()
								e.stopPropagation()

								initEdit(e.target.dataset.domain)

								return false
							})
							domLine.appendChild(domAction)
						} else {
							let domStatus = document.createElement("div")
							domStatus.innerHTML = "Status:<br /><b>"+domain.status+"</b>"
							domStatus.classList.add("status")
							domLine.appendChild(domStatus)
						}

						domResultsLines.appendChild(domLine)
					}

					generatePagination(response.result.total_count)

					domLoading.classList.add("hide")
					domResults.classList.remove("hide")
					domEmpty.classList.add("hide")
				} else {
					domLoading.classList.add("hide")
					domResults.classList.add("hide")
					domEmpty.classList.remove("hide")
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
		request.get("/domains", {
			"page": page,
			"page_size": pageSize
		})
	}
	getDomainByPage(1)
}