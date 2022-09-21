import request from "../services/request";  // 前面封装的request

//上传文件
export function upload(data,prefix) {
  return request({
    url: '/xiuxian-thirdparty/api/oss/upload',
    method: 'post',
    data,
    params:{
      prefix:prefix
    }
  })
}
