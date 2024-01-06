import * as djwt from "https://deno.land/x/djwt@v3.0.1/mod.ts"

export class Arango {
	constructor(url, username, password) {
		this.arango = url
		this.username = username
		this.password = password
		this.db = "/"
	}

	async checkToken() {
		if(!this.jwt) {
			return await this.refreshToken()
		}

		try {
			[_header, payload, _signature] = djwt.decode(this.jwt)
			if(payload.exp < (Date.now() - 60)) {
				return await this.refreshToken()
			}
		} catch {
			return await this.refreshToken()
		}

		return this.jwt
	}

	async refreshToken() {
		const ret = await fetch(this.arango + "/_open/auth", {
			method: "POST",
			body: JSON.stringify({ username: this.username, password: this.password })
		})
		const response = await ret.json()
		this.jwt = response.jwt
		return this.jwt
	}

	async query(path, method = "GET", payload = undefined) {
		const body = payload ? JSON.stringify(payload) : undefined
		const ret = await fetch(this.arango + this.db + path, {
			headers: {
				Authorization: `Bearer ${await this.checkToken()}`
			},
			method,
			body
		})
		return await ret.json()
	}

	async execute(aql, opts = {}) {
		opts.query = aql
		let cursor = await this.query("/_api/cursor", "POST", opts)
		if(cursor.error) {
			throw new Error("Arango returned error")
		}
		const result = cursor.result
		while(cursor.hasMore) {
			cursor = await this.query(`/_api/cursor/${cursor.id}`, "POST", opts)
			if(cursor.error) {
				throw new Error("Arango returned error")
			}
			result.push(...cursor.result)
		}
		return result
	}

	async createDatabase(name) {
		return await this.query("/_api/database", "POST", {name})
	}

	selectDatabase(name) {
		if(name) {
			this.db = "/_db/" + encodeURI(name) + "/"
		} else {
			this.db = "/"
		}
	}
}
