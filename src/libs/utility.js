export default {
  formatDate (date, itemNum) {
    let d = new Date(date)
    let n = itemNum || 6
    let options = {
      hour12: false,
      year: 'numeric'
    }
    if (n > 1) options.month = 'numeric'
    if (n > 2) options.day = 'numeric'
    if (n > 3) options.hour = 'numeric'
    if (n > 4) options.minute = 'numeric'
    if (n > 5) options.second = 'numeric'
    return new Intl.DateTimeFormat('zh-TW', options).format(d)
  }
}
