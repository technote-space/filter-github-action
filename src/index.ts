import { Context } from '@actions/github/lib/context';
import { getLabels } from './context';

const isTargetEventName = (events: object, context: Context): boolean => context.eventName in events;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isTargetEventAction = (action: string | any[] | Function, context: Context, some = true): boolean => {
	if (Array.isArray(action)) {
		if (some) {
			return action.some(item => isTargetEventAction(item, context, false));
		}
		return !action.some(item => !isTargetEventAction(item, context, false));
	}
	if (typeof action === 'function') {
		return action(context);
	}
	return '*' === action || context.action === action;
};

/**
 * @param {object} targets targets
 * @param {Context} context context
 * @return {boolean} is target event?
 */
export const isTargetEvent = (targets: object, context: Context): boolean => isTargetEventName(targets, context) && isTargetEventAction(targets[context.eventName], context);

/**
 * @param {string[]} includes include labels
 * @param {string[]} excludes exclude labels
 * @param {Context} context context
 * @return {boolean} is target labels?
 */
export const isTargetLabels = (includes: string[], excludes: string[], context: Context): boolean => {
	const labels = getLabels(context);
	if (false === labels) {
		return false;
	}
	return (!includes.length || !!labels.filter(label => includes.includes(label)).length) && !labels.filter(label => excludes.includes(label)).length;
};
