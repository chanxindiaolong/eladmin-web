import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/bpCardTypeInfo',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/bpCardTypeInfo/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/bpCardTypeInfo',
    method: 'put',
    data
  })
}

export function getCardTypeInfo(params) {
  return request({
    url: 'api/bpCardTypeInfo',
    method: 'get',
    params
  })
}

export default { add, edit, del, getCardTypeInfo }
