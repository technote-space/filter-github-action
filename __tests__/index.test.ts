import { Context } from '@actions/github/lib/context';
import { getContext } from '@technote-space/github-action-test-helper';
import { isTargetEvent } from '../src';

export const targets = {
	'release': [
		'published',
		'rerequested',
	],
	'push': [
		(context: Context): boolean => /^refs\/tags\//.test(context.ref),
		'rerequested',
	],
};

describe('isTargetEvent', () => {
	it('should return true 1', () => {
		expect(isTargetEvent(targets, getContext({
			eventName: 'push',
			ref: 'refs/tags/test',
		}))).toBeTruthy();
	});

	it('should return true 2', () => {
		expect(isTargetEvent(targets, getContext({
			payload: {
				action: 'rerequested',
			},
			eventName: 'push',
		}))).toBeTruthy();
	});

	it('should return true 3', () => {
		expect(isTargetEvent(targets, getContext({
			payload: {
				action: 'published',
			},
			eventName: 'release',
		}))).toBeTruthy();
	});

	it('should return false 1', () => {
		expect(isTargetEvent(targets, getContext({
			eventName: 'push',
			ref: 'refs/heads/test',
		}))).toBeFalsy();
	});

	it('should return false 2', () => {
		expect(isTargetEvent(targets, getContext({
			payload: {
				action: 'created',
			},
			eventName: 'release',
		}))).toBeFalsy();
	});
});
