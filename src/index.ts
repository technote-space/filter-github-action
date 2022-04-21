import { getInput } from '@actions/core';
import { Context } from '@actions/github/lib/context';
import { getLabels } from './context';

type OptionType = Partial<{
  notCheckPrTarget: boolean;
  notCheckWorkflowRun: boolean;
}>;

const getBoolValue = (input: string): boolean => !['false', '0', '', 'no', 'n'].includes(input.trim().toLowerCase());

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isTargetEventName = (events: any, context: Context, options?: OptionType): boolean => {
  if ('*' in events) {
    return true;
  }

  if (!options?.notCheckWorkflowRun && !('workflow_run' in events) && 'workflow_run' === context.eventName) {
    events['workflow_run'] = '*';
  }

  if (!options?.notCheckPrTarget && 'pull_request' in events && !('pull_request_target' in events)) {
    events['pull_request_target'] = events['pull_request'];
  }

  return context.eventName in events;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isTargetEventAction = (action: string | any[] | ((context: Context) => boolean), context: Context, some = true): boolean => {
  if (Array.isArray(action)) {
    if (some) {
      return action.some(item => isTargetEventAction(item, context, false));
    }
    return !action.some(item => !isTargetEventAction(item, context, false));
  }

  if (typeof action === 'function') {
    return action(context);
  }

  return '*' === action || context.payload.action === action;
};

/**
 * @param {object} targets targets
 * @param {Context} context context
 * @param {OptionType} options options
 * @return {boolean} is target event?
 */
export const isTargetEvent = (targets: any, context: Context, options?: OptionType): boolean => // eslint-disable-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
  getBoolValue(getInput('IGNORE_CONTEXT_CHECK')) ||
  (isTargetEventName(targets, context, options) && isTargetEventAction(targets[context.eventName] ?? targets['*'], context));

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
