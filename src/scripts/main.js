let isLogged = false
let token = localStorage.getItem('token')

mainNextStep = () => {
	let domLogin = document.querySelector("#login")
	let domSubmit = document.querySelector("#login input[type=submit]")

	if (!isLogged) {
		domLogin.addEventListener("submit", (e) => {
			e.preventDefault()
			e.stopImmediatePropagation()

			if (domSubmit.classList.contains('loading')) {
				return false
			}
			domSubmit.classList.add('loading')
			
			token = document.querySelector("#token").value
			
			request = new Request()
			request.done = (response) => {
				if (response.getErr() == null || response.getErr() != errTokenInvalid) {
					localStorage.setItem('token', token)
					document.location.reload()
				} else {
					Toastify({
						text: "Invalid token",
						duration: 3000,
						gravity: "top",
						position: "right",
						backgroundColor: "rgb(239, 87, 116)",
					}).showToast()
					domSubmit.classList.remove('loading')
				}
			}
			request.get("/domains")
			return false
		})
	} else {
		// remove login form
		domLogin.remove()

		// logout event
		document.querySelector("#sidebar .logout").addEventListener("click", function(e) {
			localStorage.removeItem('token')
			document.location.reload()
		})

		// init tabs
		initTabs(document.querySelectorAll(".tab-head-main > li"), document.querySelectorAll(".tab-body-main > div"))
	}
}

if (token) {
	// check if the token is still valid
	request = new Request()
	request.done = (response) => {
		if (response.getErr() == null || response.getErr() != errTokenInvalid) {
			isLogged = true
			mainNextStep()
		} else {
			localStorage.removeItem('token')
			document.location.reload()
		}
	}
	request.get("/domains")
} else {
	mainNextStep()
}

const isLocked = (epp) => {
	if (epp && epp.length) {
		for (let i = 0, iL = epp.length; i < iL; i++) {
			if (epp[i] === "clientTransferProhibited") {
				return true
			}
		}
	}
	return false
}