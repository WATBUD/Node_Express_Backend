# INI Dating 測試模式

INI Dating 以登入帳號區分測試資料與正式資料，不再使用 App 或伺服器的全域測試模式。判斷來源固定為 `ini_dating.users.is_test_account`。

## 帳號規則

- `is_test_account=TRUE`：可以登入正式或開發版 App，並可看見測試帳號及測試內容。
- `is_test_account=FALSE`：只能看見正式帳號及正式內容。
- API 在探索、語音、收件匣、公開個人檔案及聊天室的查詢層執行隔離，不能靠修改前端繞過。
- 登入 API 會回傳 `is_test_account`，前端據此決定是否載入內建展示內容。

## 測試帳號標記

`ini_dating.users.is_test_account` 是資料庫端的正式判斷來源。建立新的測試帳號後，需將該欄位設為 `TRUE`；一般註冊帳號預設為 `FALSE`。

```sql
UPDATE users SET is_test_account = TRUE WHERE user_id = 你的測試帳號ID;
```

初次部署或既有資料庫升級時執行：

```bash
npm run migrate:ini:test-accounts
```

## 目前私人測試帳號

`z23320785@gmail.com` 已標記為測試帳號。

## 發布檢查

- 所有示範或自動化測試帳號均標記 `is_test_account=TRUE`
- 一般帳號登入後，探索、收件匣及聊天室不可出現測試資料
- 測試帳號登入後，可以正常讀取與操作測試資料
