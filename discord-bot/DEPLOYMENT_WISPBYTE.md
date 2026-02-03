# Wispbyte Deployment Guide 🚀

## Package Contents

This package contains a complete Discord Application Bot ready for deployment.

**Files Included:**
- `index.js` - Main bot application
- `init.js` - Command registration script
- `package.json` - Dependencies and configuration
- `.env` - Bot credentials (configure before deployment)
- `README.md` - Complete documentation
- `QUICKSTART.md` - Quick setup guide
- `TESTING.md` - Testing guide
- `ARCHITECTURE.md` - System architecture

## Deployment on Wispbyte

### Step 1: Upload Files

1. Upload all files from this package to your Wispbyte server
2. Ensure all files are in the same directory

### Step 2: Configure Environment Variables

1. Edit the `.env` file with your bot credentials:
   ```
   DISCORD_TOKEN=your_actual_bot_token
   CLIENT_ID=your_actual_client_id
   ```

2. To get these credentials:
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application (or use existing one)
   - Go to "Bot" section → Copy the token
   - Go to "OAuth2" section → Copy the client ID

### Step 3: Install Dependencies

Run the following command via SSH or terminal:

```bash
npm install
```

This will install:
- discord.js v14.14.1
- dotenv v16.3.1

### Step 4: Register Commands

Before starting the bot, register the slash commands:

```bash
node init.js
```

You should see: "Successfully reloaded application (/) commands globally."

### Step 5: Start the Bot

**Option A: Foreground (for testing)**
```bash
node index.js
```

**Option B: Background with PM2 (recommended for production)**
```bash
npm install -g pm2
pm2 start index.js --name discord-bot
pm2 save
pm2 startup
```

**Option C: Background with nohup**
```bash
nohup node index.js > bot.log 2>&1 &
```

### Step 6: Verify Bot is Running

Check if the bot is online in your Discord server. You should see it appear as online.

**To check logs:**
```bash
# If using PM2
pm2 logs discord-bot

# If using nohup
tail -f bot.log
```

### Step 7: Configure Your Server

In your Discord server, run:
```
/setup log_channel:#applications admin_role:@Admin
```

Then deploy the panel:
```
/panel
```

## Directory Structure After Deployment

```
your-project/
├── index.js
├── init.js
├── package.json
├── .env
├── node_modules/        (created after npm install)
├── config/
│   └── servers/         (auto-created)
├── data/
│   ├── applications/    (auto-created)
│   └── cooldowns/       (auto-created)
└── documentation files
```

## Wispbyte-Specific Tips

### 1. Keep Bot Running

Use PM2 or supervisor to ensure the bot restarts on crashes:

```bash
pm2 start index.js --name discord-bot
pm2 startup
pm2 save
```

### 2. Port Configuration

This bot doesn't require any ports as it connects to Discord via WebSocket. No need to configure ports or firewalls.

### 3. Automatic Restarts

If using PM2, the bot will automatically restart on crashes:

```bash
pm2 start index.js --name discord-bot --watch
```

### 4. Memory Management

Monitor memory usage:
```bash
pm2 monit
```

### 5. Log Rotation

Configure PM2 log rotation:
```bash
pm2 install pm2-logrotate
```

## Updating the Bot

1. Stop the current process
   ```bash
   pm2 stop discord-bot
   # or
   pkill -f "node index.js"
   ```

2. Upload new files

3. Reinstall dependencies if needed
   ```bash
   npm install
   ```

4. Register commands again
   ```bash
   node init.js
   ```

5. Start the bot
   ```bash
   pm2 start discord-bot
   # or
   node index.js
   ```

## Environment Variables

Required:
- `DISCORD_TOKEN` - Your Discord bot token
- `CLIENT_ID` - Your Discord application client ID

These are stored in the `.env` file.

## File Permissions

Ensure the bot has write permissions to create:
- `config/servers/*.json`
- `data/applications/*.json`
- `data/cooldowns/*.json`

```bash
chmod -R 755 .
```

## Troubleshooting on Wispbyte

### Bot won't start
- Check Node.js version: `node --version` (needs >=16.9.0)
- Check if port 3000 is already in use (shouldn't affect this bot)
- Review error logs: `cat bot.log` or `pm2 logs`

### Commands not appearing
- Wait 5-10 minutes for Discord to sync
- Run `node init.js` again
- Restart the bot

### Permission errors
- Ensure bot has proper Discord permissions
- Check file permissions: `ls -la`

### Memory issues
- Monitor with: `pm2 monit`
- Restart bot: `pm2 restart discord-bot`

## Resource Requirements

**Minimum:**
- RAM: 100MB
- Disk: 50MB (excluding node_modules)
- CPU: Low usage
- Network: Stable internet connection

**Recommended:**
- RAM: 256MB
- Disk: 200MB
- CPU: 1 core
- Network: Stable connection with low latency

## Support & Documentation

- Full documentation: See `README.md`
- Quick start: See `QUICKSTART.md`
- Testing guide: See `TESTING.md`
- Architecture: See `ARCHITECTURE.md`

## Security Notes

1. **Never commit .env file** - Keep your bot token secret
2. **Use environment variables** - Don't hardcode credentials
3. **Regular updates** - Keep dependencies updated
4. **Monitor logs** - Check for suspicious activity
5. **Backup data** - Regularly backup the `data/` directory

## Production Checklist

- [ ] Bot token configured in `.env`
- [ ] Client ID configured in `.env`
- [ ] Dependencies installed (`npm install`)
- [ ] Commands registered (`node init.js`)
- [ ] Bot started with PM2
- [ ] Bot shows as online in Discord
- [ ] `/setup` command works
- [ ] `/panel` deploys successfully
- [ ] Test application flow
- [ ] PM2 configured for auto-restart
- [ ] Logs are being captured

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Register commands
node init.js

# Start bot (development)
node index.js

# Start bot (production with PM2)
pm2 start index.js --name discord-bot

# View logs
pm2 logs discord-bot

# Restart bot
pm2 restart discord-bot

# Stop bot
pm2 stop discord-bot

# View status
pm2 status

# Monitor resources
pm2 monit
```

---

**Made with ❤️ - Ready for Wispbyte Deployment**
