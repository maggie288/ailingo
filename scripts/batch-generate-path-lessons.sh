#!/usr/bin/env bash
# 本地分批生成 0→1 路径课时并直接发布，可断点续跑。
# 使用前：1) 在 Supabase 执行 supabase/seeds/curriculum_ai_1000.sql  2) npm run dev  3) .env.local 配好 CRON_SECRET、MiniMax
#
# 用法：
#   CRON_SECRET=你的密钥 ./scripts/batch-generate-path-lessons.sh
#   START_FROM=500 CRON_SECRET=xxx ./scripts/batch-generate-path-lessons.sh   # 从第 501 节开始续跑
#
# 环境变量：
#   CRON_SECRET  必填，与 .env.local 中一致
#   BASE_URL      可选，默认 http://localhost:3000
#   TOTAL         可选，默认 1000（总节数）
#   START_FROM    可选，默认 0（从第几节开始，用于断点续跑）
#   SLEEP         可选，每次请求间隔秒数，默认 2
#   SUPPLEMENT    可选，设为 1 时给每个节点再补一节（不跳过已有课时的节点）

set -e
BASE_URL="${BASE_URL:-http://localhost:3000}"
TOTAL="${TOTAL:-1000}"
START_FROM="${START_FROM:-0}"
SLEEP="${SLEEP:-2}"
SUPPLEMENT="${SUPPLEMENT:-0}"

if [ -z "${CRON_SECRET}" ]; then
  echo "请设置 CRON_SECRET，例如: CRON_SECRET=你的密钥 $0"
  exit 1
fi

# 默认只给「还没有课时」的节点生成；SUPPLEMENT=1 时给范围内每个节点各补一节
echo "BASE_URL=$BASE_URL TOTAL=$TOTAL START_FROM=$START_FROM SLEEP=${SLEEP}s SUPPLEMENT=$SUPPLEMENT"
echo "从第 $((START_FROM + 1)) 节生成到第 $TOTAL 节，每节请求间隔 ${SLEEP}s。"

i=$START_FROM
while [ "$i" -lt "$TOTAL" ]; do
  if [ "$SUPPLEMENT" = "1" ]; then
    p="{\"limit\":1,\"skip\":$i,\"publish\":true,\"supplement\":true}"
  else
    p="{\"limit\":1,\"skip\":$i,\"publish\":true}"
  fi
  echo -n "[$((i + 1))/$TOTAL] skip=$i ... "
  res=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/cron/generate-path-lessons" \
    -H "Authorization: Bearer $CRON_SECRET" \
    -H "Content-Type: application/json" \
    -d "$p")
  http_code=$(echo "$res" | tail -n1)
  body=$(echo "$res" | sed '$d')
  if [ "$http_code" = "200" ]; then
    created=$(echo "$body" | grep -o '"created":[0-9]*' | cut -d: -f2)
    echo "created=$created"
  else
    echo "HTTP $http_code $body"
  fi
  if [ "$i" -lt $((TOTAL - 1)) ]; then
    sleep "$SLEEP"
  fi
  i=$((i + 1))
done

echo "全部完成。"
