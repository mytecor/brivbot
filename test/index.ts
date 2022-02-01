import { matchId } from '../utils.js'
import { equal } from 'assert/strict'

it('Url parse', async () => {
	let res = await Promise.all(
		[
			'habr.com/ru/company/testComp123/blog/1/?test=123',
			'geekr.vercel.app/p/1/',
			'habr.com/post/1/',
			'habr.com/ru/post/1/',
			'habr.com/p/1/',
			'habr.com/p/1'
		].map(matchId)
	)

	res.forEach((test) => equal(test, '1'))
})
