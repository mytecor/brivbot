import fetch from 'node-fetch'

export interface Article {
	author: {
		alias: string
	}
	titleHtml: string
	textHtml: string
	metadata: {
		shareImageUrl: string
		metaDescription: string
	}
	tags: Array<{
		titleHtml: string
	}>
	etag: string
}

export async function getArticle(id?: string): Promise<Article> {
	if (!id) {
		throw Error('Not found')
	}

	return fetch(`https://habr.com/kek/v2/articles/${id}`).then(async (res) => {
		let article = (await res.json()) as Article
		if (res.status !== 200) {
			throw Error(res.statusText)
		}
		article.etag = res.headers.get('etag')?.slice(3, 7) ?? ''
		return article
	})
}

export async function matchId(query: string) {
	let [match] = query.match(/amp\.gs\/\w+/) ?? []

	if (match) {
		query = await fetch('https://' + match).then((res) => res.url)
	}

	let [_, id] =
		query.match(
			/(?<!a.devs.today\/)(?:geekr\.vercel\.app\/p|habr.com.*\/(?:blog|p|post|t))\/(\d+)/
		) ?? []

	return id
}

export function getIvUrl(id: string, etag: string) {
	return `https://a.devs.today/habr.com/p/${id}${etag ? `?${etag}` : ''}`
}
