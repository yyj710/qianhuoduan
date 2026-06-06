@echo off
cd /d C:\Users\17277\Desktop\网站前后端\backend
echo [%date% %time%] 深大公文通同步开始 >> sync-log.txt
call npx tsx scripts/sync-announcements.ts >> sync-log.txt 2>&1
echo [%date% %time%] 同步结束 >> sync-log.txt
