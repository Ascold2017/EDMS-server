const randomizer = len => {
    const ints = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    const chars = [
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
      'g',
      'h',
      'j',
      'k',
      'l',
      'm',
      'n',
      'o',
      'p',
      'r',
      's',
      't',
      'u',
      'v',
      'w',
      'x',
      'y',
      'z'
    ]
    let out = ''
    for (let i = 0; i < len; i++) {
      const ch = Math.random(1, 2)
      let ch2
      if (ch < 0.5) {
        ch2 = Math.ceil(Math.random(0, ints.length - 1) * 9)
        out += ints[ch2]
      } else {
        ch2 = Math.ceil(Math.random(0, chars.length - 1) * 9)
        out += chars[ch2]
      }
    }
    return out
  }
  
  export default randomizer
  