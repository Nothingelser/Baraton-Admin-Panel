// ============ INTELLIGENT ROW ALLOCATION SYSTEM ============

export const calculateRequiredRows = (numStudents, studentsPerRow = 10) => {
  if (!numStudents || numStudents <= 0) return [];

  const numStudentsInt = parseInt(numStudents);
  const rowsNeeded = Math.ceil(numStudentsInt / studentsPerRow);

  return Array.from({ length: rowsNeeded }, (_, i) => i + 1);
};

export const getOccupiedRows = (courses, date, time, venue, excludeCourseId = null) => {
  if (!date || !time || !venue) return [];

  const occupiedRows = [];

  courses.forEach((course) => {
    if (excludeCourseId && course.id === excludeCourseId) return;

    if (course.date === date && course.time === time && course.venue === venue) {
      if (course.rows) {
        const rows = course.rows
          .split(',')
          .map((r) => parseInt(r.trim()))
          .filter((r) => !isNaN(r));
        occupiedRows.push(...rows);
      }
    }
  });

  return occupiedRows.sort((a, b) => a - b);
};

export const allocateRows = (numStudents, occupiedRows = [], parity = 'auto') => {
  if (!numStudents || numStudents <= 0) return '';

  const numStudentsInt = parseInt(numStudents);
  const studentsPerRow = 10;
  const rowsNeeded = Math.ceil(numStudentsInt / studentsPerRow);

  let useOdd = true;
  if (parity === 'auto') {
    const oddCount = occupiedRows.filter((r) => r % 2 === 1).length;
    const evenCount = occupiedRows.filter((r) => r % 2 === 0).length;
    useOdd = evenCount >= oddCount;
  } else {
    useOdd = parity === 'odd';
  }

  const allocatedRows = [];
  let currentRow = useOdd ? 1 : 2;
  const maxRows = 50;

  while (allocatedRows.length < rowsNeeded && currentRow <= maxRows) {
    const isOccupied = occupiedRows.includes(currentRow);
    const isAdjacentToOccupied = occupiedRows.includes(currentRow - 1) || occupiedRows.includes(currentRow + 1);

    const isAdjacentToAllocated = allocatedRows.includes(currentRow - 1) || allocatedRows.includes(currentRow + 1);

    if (!isOccupied && !isAdjacentToOccupied && !isAdjacentToAllocated) {
      allocatedRows.push(currentRow);
    }

    currentRow += 2;

    if (currentRow > maxRows && allocatedRows.length < rowsNeeded) {
      useOdd = !useOdd;
      currentRow = useOdd ? 1 : 2;
    }
  }

  if (allocatedRows.length < rowsNeeded) {
    currentRow = 1;
    while (allocatedRows.length < rowsNeeded && currentRow <= maxRows) {
      if (!occupiedRows.includes(currentRow) && !allocatedRows.includes(currentRow)) {
        allocatedRows.push(currentRow);
      }
      currentRow++;
    }
  }

  return allocatedRows.sort((a, b) => a - b).join(', ');
};

export const getRowAllocationSuggestions = (courses, currentCourse) => {
  const { date, time, venue, numStudents, id: excludeId } = currentCourse;

  if (!date || !time || !venue || !numStudents) {
    return { suggestedRows: '', warning: '', occupiedRows: [] };
  }

  const occupiedRows = getOccupiedRows(courses, date, time, venue, excludeId);
  const suggestedRows = allocateRows(numStudents, occupiedRows);

  let warning = '';

  if (occupiedRows.length > 0) {
    const concurrentCourses = courses.filter(
      (c) => c.date === date && c.time === time && c.venue === venue && (!excludeId || c.id !== excludeId)
    );

    warning = `⚠️ ${concurrentCourses.length} other course(s) already scheduled in ${venue} at ${time} on ${date}. Occupied rows: ${occupiedRows.join(
      ', '
    )}`;
  }

  return {
    suggestedRows,
    warning,
    occupiedRows,
    concurrentCourses: courses.filter(
      (c) => c.date === date && c.time === time && c.venue === venue && (!excludeId || c.id !== excludeId)
    ).length,
  };
};

