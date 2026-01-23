import byuiCourse from "./course.mjs";
import { setSectionSelection } from "./sections.mjs";
import { setTitle, renderSections } from "./output.mjs";

// Initial page load
setTitle(byuiCourse);
setSectionSelection(byuiCourse.sections);
renderSections(byuiCourse.sections);

// Enroll
document.querySelector("#enrollStudent").addEventListener("click", () => {
  const sectionNum = Number(document.querySelector("#sectionNumber").value);
  byuiCourse.changeEnrollment(sectionNum);
  renderSections(byuiCourse.sections);
});

// Drop
document.querySelector("#dropStudent").addEventListener("click", () => {
  const sectionNum = Number(document.querySelector("#sectionNumber").value);
  byuiCourse.changeEnrollment(sectionNum, false);
  renderSections(byuiCourse.sections);
});
