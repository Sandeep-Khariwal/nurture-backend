export const IsStudent = (id: string) => {
  if (id.startsWith("STUD")) {
    return true;
  } else {
    return false;
  }
};
export const IsQuiz = (id: string) => {
  if (id.startsWith("QUIZ")) {
    return true;
  } else {
    return false;
  }
};

export const IsSubscriptionExpired = (studentSubscription: any) => {
  if (!studentSubscription) {
    return false;
  }

  const date = new Date();
  const fiveAndHalfHoursInMs = 5.5 * 60 * 60 * 1000;
  const now = new Date(date.getTime() + fiveAndHalfHoursInMs);

  const subscriptionStart = new Date(studentSubscription.subscriptionStart);
  const subscriptionEnd = new Date(studentSubscription.subscriptionEnd);

  // Check if current time is within the subscription window
  const isActive = now >= subscriptionStart && now <= subscriptionEnd;
  return !isActive;
};

export const IsDashboardAccessible = (student: any, examId: string) => {
  let studentSubscription = null;
  let isDashboardAccessible = false;
  if (student.subscriptions && student.subscriptions.length > 0) {
    studentSubscription = student.subscriptions.find(
      (subs: any) => subs.examId === examId
    );
  }

  if (studentSubscription) {
    const now = new Date();
    const subscriptionEnd = new Date(studentSubscription.subscriptionEnd);

    const isNotExpired = subscriptionEnd >= now;
    isDashboardAccessible =
      studentSubscription.featuresAccess.accessJournerSoFar && isNotExpired;
  }

  return isDashboardAccessible;
};

export const IsProModulesAccessible = (
  student: any,
  examId: string
): boolean => {
  let studentSubscription = null;
  let isProModulesAccessible = false;

  if (student.subscriptions && student.subscriptions.length > 0) {
    studentSubscription = student.subscriptions.find(
      (subs: any) => subs.examId === examId
    );
  }

  if (studentSubscription) {
    const now = new Date();
    const subscriptionEnd = new Date(studentSubscription.subscriptionEnd);

    const isNotExpired = subscriptionEnd >= now;
    const hasProAccess = studentSubscription.featuresAccess?.accessProModules;

    isProModulesAccessible = hasProAccess && isNotExpired;
  }

  return isProModulesAccessible;
};

export const IsSupportAndNotificationsAccessible = (
  student: any,
  examId: string
) => {
  let studentSubscription = null;
  let accessSupportAndNotifications = false;
  if (student.subscriptions && student.subscriptions.length > 0) {
    studentSubscription = student.subscriptions.find(
      (subs: any) => subs.examId === examId
    );
  }
  if (studentSubscription) {
    const now = new Date();
    const subscriptionEnd = new Date(studentSubscription.subscriptionEnd);

    const isNotExpired = subscriptionEnd >= now;
    accessSupportAndNotifications =
      studentSubscription.featuresAccess.accessSupportAndNotifications &&
      isNotExpired;
  }
  return accessSupportAndNotifications;
};

export const IsVideoLibraryAccessible = (student: any, examId: string) => {
  let studentSubscription = null;
  let accessVideoLibrary = false;
  if (student.subscriptions && student.subscriptions.length > 0) {
    studentSubscription = student.subscriptions.find(
      (subs: any) => subs.examId === examId
    );
  }
  if (studentSubscription) {
    const now = new Date();
    const subscriptionEnd = new Date(studentSubscription.subscriptionEnd);

    const isNotExpired = subscriptionEnd >= now;
    accessVideoLibrary =
      studentSubscription.featuresAccess.accessVideoLibrary && isNotExpired;
  }
  return accessVideoLibrary;
};

export const IsVideoComboAccessible = (student: any, examId: string) => {
  let studentSubscription = null;
  let accessVideoCombo = false;
  if (student.subscriptions && student.subscriptions.length > 0) {
    studentSubscription = student.subscriptions.find(
      (subs: any) => subs.examId === examId
    );
  }
  if (studentSubscription) {
    const now = new Date();
    const subscriptionEnd = new Date(studentSubscription.subscriptionEnd);

    const isNotExpired = subscriptionEnd >= now;
    accessVideoCombo =
      studentSubscription.featuresAccess.accessVideoCombo && isNotExpired;
  }
  return accessVideoCombo;
};

export const IsPrioritySupportAccessible = (student: any, examId: string) => {
  let studentSubscription = null;
  let accessPrioritySupport = false;
  if (student.subscriptions && student.subscriptions.length > 0) {
    studentSubscription = student.subscriptions.find(
      (subs: any) => subs.examId === examId
    );
  }
  if (studentSubscription) {
    const now = new Date();
    const subscriptionEnd = new Date(studentSubscription.subscriptionEnd);

    const isNotExpired = subscriptionEnd >= now;
    accessPrioritySupport =
      studentSubscription.featuresAccess.accessPrioritySupport && isNotExpired;
  }
  return accessPrioritySupport;
};

export function FormatDate(date: string | Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(date).toLocaleDateString(undefined, options);
}
