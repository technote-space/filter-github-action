import { Context } from '@actions/github/lib/context';

export const getContext = (override: object): Context => Object.assign({
	payload: {},
	eventName: '',
	sha: '',
	ref: '',
	workflow: '',
	action: '',
	actor: '',
	issue: {
		owner: '',
		repo: '',
		number: 1,
	},
	repo: {
		owner: '',
		repo: '',
	},
}, override);
