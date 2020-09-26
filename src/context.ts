import {Context} from '@actions/github/lib/context';

export const getLabels = (context: Context): string[] | false => {
  if ('issues' === context.eventName) {
    return context.payload.issue && 'labels' in context.payload.issue ? context.payload.issue.labels.map(label => label.name) : false;
  }

  if ('pull_request' === context.eventName || 'pull_request_target' === context.eventName) {
    return context.payload.pull_request && 'labels' in context.payload.pull_request ? context.payload.pull_request.labels.map(label => label.name) : false;
  }

  return [];
};
