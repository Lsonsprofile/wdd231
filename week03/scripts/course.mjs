const byuiCourse = {
  code: "WDD231",
  name: "Web Frontend Development I",
  sections: [
    {
      sectionNumber: 1,
      enrolled: 88,
      instructor: "Brother Bingham",
    },
    {
      sectionNumber: 2,
      enrolled: 81,
      instructor: "Sister Shultz",
    },
    {
      sectionNumber: 3,
      enrolled: 95,
      instructor: "Sister Smith",
    },
  ],

  changeEnrollment(sectionNumber, add = true) {
    const section = this.sections.find(
      (s) => s.sectionNumber === sectionNumber
    );

    if (section) {
      add ? section.enrolled++ : section.enrolled--;
    }
  },
};

export default byuiCourse;