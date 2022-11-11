/**
 * 定义需要使用的各种常量
 * @type {number}
 */

/**
 * 用于聊天消息
 * @type {number}
 */
// 文本消息
export const TEXT_CHAT_MESSAGE_TYPE=0;
// 图片消息
export const IMAGE_CHAT_MESSAGE_TYPE=1;
//公群公告消息
export const GROUP_ANNOUNCEMENT_MESSAGE_TYPE=2;
// 朋友类型
export const FRIEND_TYPE = 0;
// 群组类型
export const GROUP_TYPE = 1;
/**
 * 用于通知消息
 * @type {number}
 */
//添加好友通知
export const ADD_FRIEND_NOTICE=1;
//消息验证通知
export const SEND_MESSAGE_NOTICE=2;
//加群通知
export const ADD_GROUP_NOTICE=3;
//添加好友申请成功通知
export const ADD_FRIEND_SUCCESS_NOTICE=4;
//群公告发布通知
export const GROUP_ANNOUNCEMENT_NOTICE=5;
//消息发送成功状态
export const SUCCESS_SEND_STATUS=0;
//等待接受状态
export const WAITING_FOR_RECEIVE_STATUS=1;
//添加好友申请已过期状态
export const EXPIREd_STATUS=2;
//已添加好友状态
export const ADDED_STATUS=3;
//等待验证状态
export const WAITING_FOR_VERIFY_STATUS=4;

/**
 * 用于自定义穿梭框
 * @type {number}
 */
// 推荐给朋友
export const RECOMMENDATION_TO_FRIEND_FUNCTION=1;
// 创建群聊前添加朋友形成群聊
export const ADD_FRIEND_FUNCTION=2;
// 创建群聊后邀请朋友入群
export const INVITATION_FRIEND_ENTER_GROUP_FUNCTION=3;
// 从群中移除成员
export const REMOVE_MEMBER_FROM_GROUP_FUNCTION=4;
