export const formatDate = (dateString) => {
  const date = new Date(dateString.replace(" ", "T"));

  const hasTime = /\d{2}:\d{2}(:\d{2})?$/.test(dateString);

  const options = {
    weekday: "long",
    month: "long",
    day: "numeric",
  };

  if (hasTime) {
    options.hour = "numeric";
    options.minute = "2-digit";
    options.hour12 = true;
  }

  return new Intl.DateTimeFormat("en-US", options).format(date);
};

export const formatDateFull = (dateString) => {
  const date = new Date(dateString.replace(" ", "T"));

  const hasTime = /\d{2}:\d{2}(:\d{2})?$/.test(dateString);

  const options = {
    month: "long",
    day: "numeric",
    year: "numeric",
  };

  if (hasTime) {
    options.hour = "numeric";
    options.minute = "2-digit";
    options.hour12 = true;
  }

  return new Intl.DateTimeFormat("en-US", options).format(date);
};

export const formatMonthDay = (dateString) => {
  const date = new Date(dateString.replace(" ", "T"));

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
};
