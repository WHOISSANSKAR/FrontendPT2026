import {
  ProjectItem,
  ProjectLocation,
  LocationMilestone,
  MilestoneTask,
} from '../types';
import { isOverdue, isTaskOverdue } from './overdue';

export interface OverdueNavigationTarget {
  level: 'task' | 'milestone' | 'location' | 'project';
  projectId: string;
  locationId?: string;
  milestoneId?: string;
  taskId?: string;
  label: string;
}

export interface MilestoneOverdueInfo {
  isSelfOverdue: boolean;
  hasOverdueTask: boolean;
  hasAnyOverdue: boolean;
  overdueTaskCount: number;
  firstOverdueTask?: MilestoneTask;
}

export interface LocationOverdueInfo {
  isSelfOverdue: boolean;
  hasOverdueMilestone: boolean;
  hasOverdueTask: boolean;
  hasAnyOverdue: boolean;
  overdueMilestoneCount: number;
  overdueTaskCount: number;
  firstTarget?: OverdueNavigationTarget;
}

export interface ProjectOverdueInfo {
  isSelfOverdue: boolean;
  hasOverdueLocation: boolean;
  hasOverdueMilestone: boolean;
  hasOverdueTask: boolean;
  hasAnyOverdue: boolean;
  overdueLocationCount: number;
  overdueMilestoneCount: number;
  overdueTaskCount: number;
  firstTarget?: OverdueNavigationTarget;
}

export const getTaskOverdueInfo = (task: MilestoneTask) => ({
  isSelfOverdue: isTaskOverdue(task),
});

export const getMilestoneOverdueInfo = (
  milestone: LocationMilestone,
  projectId?: string,
  locationId?: string
): MilestoneOverdueInfo => {
  const isSelfOverdue = isOverdue(
    milestone.endDate,
    milestone.status,
    milestone.progress
  );
  const tasks = milestone.tasks || [];
  const overdueTasks = tasks.filter(isTaskOverdue);
  const firstOverdueTask = overdueTasks[0];

  return {
    isSelfOverdue,
    hasOverdueTask: overdueTasks.length > 0,
    hasAnyOverdue: isSelfOverdue || overdueTasks.length > 0,
    overdueTaskCount: overdueTasks.length,
    firstOverdueTask,
  };
};

export const getLocationOverdueInfo = (
  location: ProjectLocation,
  projectId: string
): LocationOverdueInfo => {
  const isSelfOverdue =
    location.status !== 'Completed' &&
    isOverdue(location.endDate, location.status, location.progress);

  const milestones = location.milestones || [];
  let overdueMilestoneCount = 0;
  let overdueTaskCount = 0;
  let firstMilestoneTarget: OverdueNavigationTarget | undefined;
  let firstTaskTarget: OverdueNavigationTarget | undefined;

  for (const m of milestones) {
    const mInfo = getMilestoneOverdueInfo(m, projectId, location.id);
    if (mInfo.isSelfOverdue) {
      overdueMilestoneCount += 1;
      if (!firstMilestoneTarget) {
        firstMilestoneTarget = {
          level: 'milestone',
          projectId,
          locationId: location.id,
          milestoneId: m.id,
          label: `Overdue milestone: ${m.name} (${location.city})`,
        };
      }
    }
    if (mInfo.hasOverdueTask && mInfo.firstOverdueTask) {
      overdueTaskCount += mInfo.overdueTaskCount;
      if (!firstTaskTarget) {
        firstTaskTarget = {
          level: 'task',
          projectId,
          locationId: location.id,
          milestoneId: m.id,
          taskId: mInfo.firstOverdueTask.id,
          label: `Overdue task: ${mInfo.firstOverdueTask.name} (${m.name})`,
        };
      }
    }
  }

  const selfTarget: OverdueNavigationTarget | undefined = isSelfOverdue
    ? {
        level: 'location',
        projectId,
        locationId: location.id,
        label: `Overdue location: ${location.city}`,
      }
    : undefined;

  const firstTarget = firstTaskTarget || firstMilestoneTarget || selfTarget;

  return {
    isSelfOverdue,
    hasOverdueMilestone: overdueMilestoneCount > 0,
    hasOverdueTask: overdueTaskCount > 0,
    hasAnyOverdue:
      isSelfOverdue || overdueMilestoneCount > 0 || overdueTaskCount > 0,
    overdueMilestoneCount,
    overdueTaskCount,
    firstTarget,
  };
};

export const getProjectOverdueInfo = (
  project: ProjectItem
): ProjectOverdueInfo => {
  const isSelfOverdue =
    project.status !== 'Completed' &&
    project.status !== 'Delivered' &&
    isOverdue(project.expectedCompletion, project.status, project.progress);

  const locations = project.locations || [];
  let overdueLocationCount = 0;
  let overdueMilestoneCount = 0;
  let overdueTaskCount = 0;
  let firstTarget: OverdueNavigationTarget | undefined;

  const priorityOrder: Record<OverdueNavigationTarget['level'], number> = {
    task: 1,
    milestone: 2,
    location: 3,
    project: 4,
  };

  for (const loc of locations) {
    const locInfo = getLocationOverdueInfo(loc, project.id);
    if (locInfo.isSelfOverdue) {
      overdueLocationCount += 1;
    }
    overdueMilestoneCount += locInfo.overdueMilestoneCount;
    overdueTaskCount += locInfo.overdueTaskCount;

    if (locInfo.firstTarget) {
      if (
        !firstTarget ||
        priorityOrder[locInfo.firstTarget.level] <
          priorityOrder[firstTarget.level]
      ) {
        firstTarget = locInfo.firstTarget;
      }
    }
  }

  if (!firstTarget && isSelfOverdue) {
    firstTarget = {
      level: 'project',
      projectId: project.id,
      label: `Overdue project: ${project.name}`,
    };
  }

  return {
    isSelfOverdue,
    hasOverdueLocation: overdueLocationCount > 0,
    hasOverdueMilestone: overdueMilestoneCount > 0,
    hasOverdueTask: overdueTaskCount > 0,
    hasAnyOverdue:
      isSelfOverdue ||
      overdueLocationCount > 0 ||
      overdueMilestoneCount > 0 ||
      overdueTaskCount > 0,
    overdueLocationCount,
    overdueMilestoneCount,
    overdueTaskCount,
    firstTarget,
  };
};