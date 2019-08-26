class Request {
	done() {}

	getResult() {
		return this.result || null;
	}

	getErr() {
		return this.err || null;
	}

	/**
	 * @param {string} url The url starting with a slash
	 * @param {Object<string, string>} params Url params (optional)
	 * @return {Response} A Response object
	 */
	get(url, params, baseURL = mainURL) {
		let r = new XMLHttpRequest()
		let response = this
		var uri = baseURL + url
	
		if (params) {
			let first = true
			for (let key in params) {
				if (first) {
					first = false
					uri+= '?'
				} else {
					uri+= '&'
				}
				uri+= key+"="+params[key]
			}
		}
	
		r.open('GET', uri, true)
		r.setRequestHeader('x-auth-token', token)
	
		r.onload = function() {
			if (this.status == 200) {
				response.result = JSON.parse(this.response)
			} else if (this.status == 401) {
				response.err = errTokenInvalid
			} else {
				response.err = errUndefined
			}
			return response.done(response)
		};
	
		r.onerror = function() {
			response.err = errUndefined
			return response.done(response)
		};
	
		r.send()
		return this
	}

	/**
	 * @param {string} url The url starting with a slash
	 * @param {Object<string, string>} params Body params send in JSON (optional)
	 * @return {Response} A Response object
	 */
	post(url, params, baseURL = mainURL) {
		let r = new XMLHttpRequest()
		let response = this
		var uri = baseURL + url
	
		r.open('POST', uri, true)
		r.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
		r.setRequestHeader('x-auth-token', token)
	
		r.onload = function() {
			if (this.status == 200) {
				response.result = JSON.parse(this.response)
			} else if (this.status == 401) {
				response.err = errTokenInvalid
			} else {
				if (this.response) {
					response.result = JSON.parse(this.response) || null
				}

				if (response.result && response.result.message) {
					response.err = response.result.message
				} else {
					response.err = errUndefined
				}
			}
			return response.done(response)
		};
	
		r.onerror = function() {
			response.err = errUndefined
			return response.done(response)
		};
	
		if (params) {
			r.send(JSON.stringify(params))
		} else {
			r.send()
		}
		return this
	}

	/**
	 * @param {string} url The url starting with a slash
	 * @param {Object<string, string>} params Body params send in JSON (optional)
	 * @return {Response} A Response object
	 */
	patch(url, params, baseURL = mainURL) {
		let r = new XMLHttpRequest()
		let response = this
		var uri = baseURL + url
	
		r.open('PATCH', uri, true)
		r.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
		r.setRequestHeader('x-auth-token', token)
	
		r.onload = function() {
			if (this.status == 200) {
				response.result = JSON.parse(this.response)
			} else if (this.status == 401) {
				response.err = errTokenInvalid
			} else {
				if (this.response) {
					response.result = JSON.parse(this.response) || null
				}

				if (response.result && response.result.message) {
					response.err = response.result.message
				} else {
					response.err = errUndefined
				}
			}
			return response.done(response)
		};
	
		r.onerror = function() {
			response.err = errUndefined
			return response.done(response)
		};
	
		if (params) {
			r.send(JSON.stringify(params))
		} else {
			r.send()
		}
		return this
	}
}
