
module.exports = (students) => {

  let got = true

  while (got){
    const n = Math.floor((Math.random() * 100) + 1)

    let color = ''
    if (n > 0 && n < 19){
      color = 'green'

    } else if (n > 18 && n < 52 ) {
      color = 'yellow'
    }
    else {
      color = 'red'
    }

    const oneStudent =  students.filter((student) => {
      if (student.current_color === color){
        got = false
        return student
      }
    })

    if (oneStudent != []){
      return oneStudent
    }
  }
}
