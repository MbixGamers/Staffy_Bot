require('dotenv').config();
require('./keep_alive.js');
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: ['CHANNEL']
});

// Utility Functions
function getServerConfigPath(guildId) {
  return path.join(__dirname, 'config', 'servers', `${guildId}.json`);
}

function getApplicationsPath(guildId) {
  return path.join(__dirname, 'data', 'applications', `${guildId}.json`);
}

function getCooldownsPath(guildId) {
  return path.join(__dirname, 'data', 'cooldowns', `${guildId}.json`);
}

function loadServerConfig(guildId) {
  const configPath = getServerConfigPath(guildId);
  if (!fs.existsSync(configPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function saveServerConfig(guildId, config) {
  const configPath = getServerConfigPath(guildId);
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function loadApplications(guildId) {
  const appsPath = getApplicationsPath(guildId);
  if (!fs.existsSync(appsPath)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(appsPath, 'utf8'));
}

function saveApplications(guildId, applications) {
  const appsPath = getApplicationsPath(guildId);
  fs.writeFileSync(appsPath, JSON.stringify(applications, null, 2));
}

function loadCooldowns(guildId) {
  const cooldownPath = getCooldownsPath(guildId);
  if (!fs.existsSync(cooldownPath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(cooldownPath, 'utf8'));
}

function saveCooldowns(guildId, cooldowns) {
  const cooldownPath = getCooldownsPath(guildId);
  fs.writeFileSync(cooldownPath, JSON.stringify(cooldowns, null, 2));
}

function isAdmin(member, config) {
  if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;
  if (!config || !config.adminRoleIds) return false;
  return config.adminRoleIds.some(roleId => member.roles.cache.has(roleId));
}

function checkCooldown(userId, guildId, config, member) {
  if (member && member.permissions.has(PermissionFlagsBits.Administrator)) return { canApply: true };
  
  const cooldowns = loadCooldowns(guildId);
  if (!cooldowns[userId]) return { canApply: true };
  
  const lastApplication = cooldowns[userId];
  const cooldownHours = config.cooldownHours || 24;
  const cooldownMs = cooldownHours * 60 * 60 * 1000;
  const timePassed = Date.now() - lastApplication;
  
  if (timePassed < cooldownMs) {
    const timeLeft = cooldownMs - timePassed;
    const hoursLeft = Math.ceil(timeLeft / (60 * 60 * 1000));
    return { canApply: false, hoursLeft };
  }
  
  return { canApply: true };
}

function setCooldown(userId, guildId) {
  const cooldowns = loadCooldowns(guildId);
  cooldowns[userId] = Date.now();
  saveCooldowns(guildId, cooldowns);
}

// Active application sessions (userId -> {guildId, category, answers, currentQuestion})
const activeApplications = new Map();

client.once('ready', () => {
  console.log(`✅ Bot is ready! Logged in as ${client.user.tag}`);
  console.log(`🔗 Invite URL: https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&permissions=8&scope=bot%20applications.commands`);
});

// Error handler
client.on('error', error => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

// Slash Command Handler
client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    await handleSlashCommand(interaction);
  } else if (interaction.isStringSelectMenu()) {
    await handleSelectMenu(interaction);
  } else if (interaction.isButton()) {
    await handleButton(interaction);
  } else if (interaction.isModalSubmit()) {
    await handleModal(interaction);
  }
});

// Slash Command Handler
async function handleSlashCommand(interaction) {
  const { commandName, guildId, member } = interaction;
  
  const config = loadServerConfig(guildId);
  
  // Admin check for admin-only commands
  const adminCommands = ['setup', 'addcategory', 'editquestions', 'removecategory', 'setlogchannel', 'setticketcategory', 'viewconfig', 'setcooldown', 'addadminrole', 'removeadminrole', 'addquestion', 'removequestion', 'listquestions', 'pendingapplications'];
  if (adminCommands.includes(commandName)) {
    if (!isAdmin(member, config)) {
      return interaction.reply({ content: '❌ You need administrator permissions or an admin role to use this command.', ephemeral: true });
    }
  }
  
  switch (commandName) {
    case 'help':
      await handleHelp(interaction);
      break;
    case 'setup':
      await handleSetup(interaction);
      break;
    case 'panel':
      await handlePanel(interaction);
      break;
    case 'addcategory':
      await handleAddCategory(interaction);
      break;
    case 'editquestions':
      await handleEditQuestions(interaction);
      break;
    case 'removecategory':
      await handleRemoveCategory(interaction);
      break;
    case 'setlogchannel':
      await handleSetLogChannel(interaction);
      break;
    case 'setticketcategory':
      await handleSetTicketCategory(interaction);
      break;
    case 'viewconfig':
      await handleViewConfig(interaction);
      break;
    case 'setcooldown':
      await handleSetCooldown(interaction);
      break;
    case 'addadminrole':
      await handleAddAdminRole(interaction);
      break;
    case 'removeadminrole':
      await handleRemoveAdminRole(interaction);
      break;
    case 'addquestion':
      await handleAddQuestion(interaction);
      break;
    case 'removequestion':
      await handleRemoveQuestion(interaction);
      break;
    case 'listquestions':
      await handleListQuestions(interaction);
      break;
    case 'pendingapplications':
      await handlePendingApplications(interaction);
      break;
  }
}

// Help Command
async function handleHelp(interaction) {
  const helpEmbed = new EmbedBuilder()
    .setTitle('📚 Application Bot - Command Guide')
    .setDescription('Complete guide to all available commands')
    .setColor('#5865F2')
    .addFields(
      {
        name: '🔧 Setup Commands (Admin Only)',
        value: '`/setup` - Initial bot configuration\n`/addadminrole` - Add additional admin roles\n`/removeadminrole` - Remove an admin role\n`/setlogchannel` - Change log channel\n`/setticketcategory` - Set ticket category\n`/setcooldown` - Adjust application cooldown',
        inline: false
      },
      {
        name: '📋 Category Management (Admin Only)',
        value: '`/addcategory` - Add new application type\n`/removecategory` - Remove application type\n`/viewconfig` - View current configuration',
        inline: false
      },
      {
        name: '❓ Question Management (Admin Only)',
        value: '`/addquestion` - Add a question to category (max 20)\n`/removequestion` - Remove a question by number\n`/listquestions` - View all questions for a category\n`/editquestions` - Quick edit first 5 questions',
        inline: false
      },
      {
        name: '🚀 Deployment',
        value: '`/panel` - Deploy application panel\nUsers can then apply via dropdown menu',
        inline: false
      },
      {
        name: '📖 Getting Started',
        value: '1. Run `/setup` with log channel and admin role\n2. Optionally add more categories with `/addcategory`\n3. Add/edit questions with `/addquestion` or `/editquestions`\n4. Deploy panel with `/panel`\n5. Users click dropdown → Bot DMs questions',
        inline: false
      },
      {
        name: '👥 Admin Review Process',
        value: 'When applications arrive, admins see 4 buttons:\n✅ **Accept** - Approve and assign role\n❌ **Deny** - Reject with reason\n📋 **History** - View past applications\n🎫 **Open Ticket** - Create private channel',
        inline: false
      },
      {
        name: '⚙️ Features',
        value: '• Multi-server support (isolated data)\n• Up to 20 questions per category\n• Text or Yes/No question types\n• Auto-role assignment\n• Application cooldown system\n• Private ticket creation\n• Complete history tracking',
        inline: false
      }
    )
    .setFooter({ text: 'Use /help anytime to see this guide' })
    .setTimestamp();

  await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
}

// Setup Command
async function handleSetup(interaction) {
  try {
    await interaction.deferReply({ ephemeral: true });
    
    const logChannel = interaction.options.getChannel('log_channel');
    const adminRole = interaction.options.getRole('admin_role');
    
    const defaultConfig = {
      guildId: interaction.guildId,
      logChannelId: logChannel.id,
      ticketCategoryId: null,
      adminRoleIds: [adminRole.id],
      cooldownHours: 24,
      categories: [
        {
          name: 'Staff',
          description: 'Apply to become a staff member',
          roleId: null,
          questions: [
            { text: 'What is your name?', type: 'text' },
            { text: 'How old are you?', type: 'text' },
            { text: 'Why do you want to join the staff team?', type: 'text' },
            { text: 'Do you have any previous staff experience?', type: 'yes_no' },
            { text: 'How many hours per week can you dedicate?', type: 'text' }
          ]
        }
      ]
    };
    
    saveServerConfig(interaction.guildId, defaultConfig);
    
    await interaction.editReply({
      content: `✅ **Bot Setup Complete!**\n\n📋 Log Channel: ${logChannel}\n👑 Admin Role: ${adminRole}\n⏰ Cooldown: 24 hours\n📝 Default Category: Staff\n\nUse \`/panel\` to deploy the application panel!`
    });
  } catch (error) {
    console.error('Error in handleSetup:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: '❌ An error occurred!', ephemeral: true });
    } else {
      await interaction.editReply({ content: '❌ An error occurred!' });
    }
  }
}

// Panel Command
async function handlePanel(interaction) {
  try {
    await interaction.deferReply({ ephemeral: true });
    
    const config = loadServerConfig(interaction.guildId);
    
    if (!config) {
      return interaction.editReply({
        content: '❌ Please run `/setup` first to configure the bot!'
      });
    }
    
    if (config.categories.length === 0) {
      return interaction.editReply({
        content: '❌ No application categories configured. Use `/addcategory` to add one!'
      });
    }
    
    const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
    
    // Build embed description
    let description = '**Welcome to our Application System!**\n\nSelect the type of application you wish to submit from the dropdown menu below.\n\n**Available Positions:**\n\n';
    
    config.categories.forEach((cat, index) => {
      description += `**${index + 1}. ${cat.name}**\n${cat.description}\n\n`;
    });
    
    const embed = new EmbedBuilder()
      .setTitle('📋 Application Panel')
      .setDescription(description)
      .setColor('#5865F2')
      .setFooter({ text: 'Select an option below to begin your application' })
      .setTimestamp();
    
    // Build select menu
    const options = config.categories.map(cat => ({
      label: cat.name,
      description: cat.description.substring(0, 100),
      value: `apply_${cat.name.toLowerCase().replace(/\s+/g, '_')}`
    }));
    
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('application_select')
      .setPlaceholder('Choose an application type...')
      .addOptions(options);
    
    const row = new ActionRowBuilder().addComponents(selectMenu);
    
    await targetChannel.send({ embeds: [embed], components: [row] });
    
    await interaction.editReply({
      content: `✅ Application panel deployed in ${targetChannel}!`
    });
  } catch (error) {
    console.error('Error in handlePanel:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: '❌ An error occurred!', ephemeral: true });
    } else {
      await interaction.editReply({ content: '❌ An error occurred!' });
    }
  }
}

// Add Category Command
async function handleAddCategory(interaction) {
  const config = loadServerConfig(interaction.guildId);
  
  if (!config) {
    return interaction.reply({
      content: '❌ Please run `/setup` first!',
      ephemeral: true
    });
  }
  
  const name = interaction.options.getString('name');
  const description = interaction.options.getString('description');
  const roles = [
    interaction.options.getRole('role1'),
    interaction.options.getRole('role2'),
    interaction.options.getRole('role3'),
    interaction.options.getRole('role4')
  ].filter(r => r !== null);
  
  // Check if category already exists
  if (config.categories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
    return interaction.reply({
      content: `❌ Category "${name}" already exists!`,
      ephemeral: true
    });
  }
  
  const newCategory = {
    name,
    description,
    roleIds: roles.map(r => r.id),
    questions: [
      { text: 'What is your name?', type: 'text' },
      { text: 'Why do you want to apply for this position?', type: 'text' },
      { text: 'Do you have any relevant experience?', type: 'yes_no' }
    ]
  };
  
  config.categories.push(newCategory);
  saveServerConfig(interaction.guildId, config);
  
  await interaction.reply({
    content: `✅ Category "${name}" added successfully!\n${roles.length > 0 ? `🎭 Auto-roles: ${roles.join(', ')}` : ''}\n\n💡 Use \`/editquestions category:${name}\` to customize the questions.`,
    ephemeral: true
  });
}

// Edit Questions Command
async function handleEditQuestions(interaction) {
  const config = loadServerConfig(interaction.guildId);
  
  if (!config) {
    return interaction.reply({
      content: '❌ Please run `/setup` first!',
      ephemeral: true
    });
  }
  
  const categoryName = interaction.options.getString('category');
  const category = config.categories.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
  
  if (!category) {
    return interaction.reply({
      content: `❌ Category "${categoryName}" not found!`,
      ephemeral: true
    });
  }
  
  const modal = new ModalBuilder()
    .setCustomId(`edit_questions_${categoryName}`)
    .setTitle(`Edit Questions: ${categoryName}`);
  
  // Show first 5 questions in modal
  for (let i = 0; i < Math.min(5, category.questions.length); i++) {
    const input = new TextInputBuilder()
      .setCustomId(`question_${i}`)
      .setLabel(`Question ${i + 1}`)
      .setStyle(TextInputStyle.Short)
      .setValue(category.questions[i].text)
      .setRequired(false);
    
    modal.addComponents(new ActionRowBuilder().addComponents(input));
  }
  
  await interaction.showModal(modal);
}

// Remove Category Command
async function handleRemoveCategory(interaction) {
  const config = loadServerConfig(interaction.guildId);
  
  if (!config) {
    return interaction.reply({
      content: '❌ Please run `/setup` first!',
      ephemeral: true
    });
  }
  
  const categoryName = interaction.options.getString('category');
  const index = config.categories.findIndex(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
  
  if (index === -1) {
    return interaction.reply({
      content: `❌ Category "${categoryName}" not found!`,
      ephemeral: true
    });
  }
  
  config.categories.splice(index, 1);
  saveServerConfig(interaction.guildId, config);
  
  await interaction.reply({
    content: `✅ Category "${categoryName}" removed successfully!`,
    ephemeral: true
  });
}

// Set Log Channel Command
async function handleSetLogChannel(interaction) {
  const config = loadServerConfig(interaction.guildId);
  
  if (!config) {
    return interaction.reply({
      content: '❌ Please run `/setup` first!',
      ephemeral: true
    });
  }
  
  const channel = interaction.options.getChannel('channel');
  config.logChannelId = channel.id;
  saveServerConfig(interaction.guildId, config);
  
  await interaction.reply({
    content: `✅ Log channel set to ${channel}!`,
    ephemeral: true
  });
}

// Set Ticket Category Command
async function handleSetTicketCategory(interaction) {
  const config = loadServerConfig(interaction.guildId);
  
  if (!config) {
    return interaction.reply({
      content: '❌ Please run `/setup` first!',
      ephemeral: true
    });
  }
  
  const category = interaction.options.getChannel('category');
  
  if (category.type !== ChannelType.GuildCategory) {
    return interaction.reply({
      content: '❌ Please select a category channel!',
      ephemeral: true
    });
  }
  
  config.ticketCategoryId = category.id;
  saveServerConfig(interaction.guildId, config);
  
  await interaction.reply({
    content: `✅ Ticket category set to ${category.name}!`,
    ephemeral: true
  });
}

// View Config Command
async function handleViewConfig(interaction) {
  const config = loadServerConfig(interaction.guildId);
  
  if (!config) {
    return interaction.reply({
      content: '❌ Please run `/setup` first!',
      ephemeral: true
    });
  }
  
  const logChannel = await interaction.guild.channels.fetch(config.logChannelId).catch(() => null);
  const ticketCategory = config.ticketCategoryId ? await interaction.guild.channels.fetch(config.ticketCategoryId).catch(() => null) : null;
  
  let configText = `**Server Configuration**\n\n`;
  configText += `📋 **Log Channel:** ${logChannel || 'Not set'}\n`;
  configText += `🎫 **Ticket Category:** ${ticketCategory ? ticketCategory.name : 'Not set'}\n`;
  configText += `⏰ **Cooldown:** ${config.cooldownHours} hours\n`;
  configText += `👑 **Admin Roles:** ${config.adminRoleIds.map(id => `<@&${id}>`).join(', ')}\n\n`;
  configText += `**Application Categories:** (${config.categories.length})\n\n`;
  
  config.categories.forEach(cat => {
    configText += `**• ${cat.name}**\n`;
    configText += `  Description: ${cat.description}\n`;
    configText += `  Auto-role: ${cat.roleId ? `<@&${cat.roleId}>` : 'None'}\n`;
    configText += `  Questions: ${cat.questions.length}\n\n`;
  });
  
  await interaction.reply({
    content: configText,
    ephemeral: true
  });
}

// Set Cooldown Command
async function handleSetCooldown(interaction) {
  const config = loadServerConfig(interaction.guildId);
  
  if (!config) {
    return interaction.reply({
      content: '❌ Please run `/setup` first!',
      ephemeral: true
    });
  }
  
  const hours = interaction.options.getInteger('hours');
  
  if (hours < 0 || hours > 168) {
    return interaction.reply({
      content: '❌ Cooldown must be between 0 and 168 hours (1 week)!',
      ephemeral: true
    });
  }
  
  config.cooldownHours = hours;
  saveServerConfig(interaction.guildId, config);
  
  await interaction.reply({
    content: `✅ Application cooldown set to ${hours} hours!`,
    ephemeral: true
  });
}

// Add Admin Role Command
async function handleAddAdminRole(interaction) {
  const config = loadServerConfig(interaction.guildId);
  
  if (!config) {
    return interaction.reply({
      content: '❌ Please run `/setup` first!',
      ephemeral: true
    });
  }
  
  const role = interaction.options.getRole('role');
  
  if (config.adminRoleIds.includes(role.id)) {
    return interaction.reply({
      content: `❌ ${role} is already an admin role!`,
      ephemeral: true
    });
  }
  
  config.adminRoleIds.push(role.id);
  saveServerConfig(interaction.guildId, config);
  
  await interaction.reply({
    content: `✅ ${role} added as admin role! Total admin roles: ${config.adminRoleIds.length}`,
    ephemeral: true
  });
}

// Remove Admin Role Command
async function handleRemoveAdminRole(interaction) {
  const config = loadServerConfig(interaction.guildId);
  
  if (!config) {
    return interaction.reply({
      content: '❌ Please run `/setup` first!',
      ephemeral: true
    });
  }
  
  const role = interaction.options.getRole('role');
  
  if (!config.adminRoleIds.includes(role.id)) {
    return interaction.reply({
      content: `❌ ${role} is not an admin role!`,
      ephemeral: true
    });
  }
  
  if (config.adminRoleIds.length === 1) {
    return interaction.reply({
      content: '❌ Cannot remove the last admin role! Add another admin role first.',
      ephemeral: true
    });
  }
  
  config.adminRoleIds = config.adminRoleIds.filter(id => id !== role.id);
  saveServerConfig(interaction.guildId, config);
  
  await interaction.reply({
    content: `✅ ${role} removed from admin roles! Remaining admin roles: ${config.adminRoleIds.length}`,
    ephemeral: true
  });
}

// Add Question Command
async function handleAddQuestion(interaction) {
  const config = loadServerConfig(interaction.guildId);
  
  if (!config) {
    return interaction.reply({
      content: '❌ Please run `/setup` first!',
      ephemeral: true
    });
  }
  
  const categoryName = interaction.options.getString('category');
  const questionText = interaction.options.getString('question');
  const questionType = interaction.options.getString('type');
  
  const category = config.categories.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
  
  if (!category) {
    return interaction.reply({
      content: `❌ Category "${categoryName}" not found!`,
      ephemeral: true
    });
  }
  
  if (category.questions.length >= 20) {
    return interaction.reply({
      content: `❌ Maximum 20 questions per category! Category "${categoryName}" already has 20 questions.`,
      ephemeral: true
    });
  }
  
  category.questions.push({
    text: questionText,
    type: questionType
  });
  
  saveServerConfig(interaction.guildId, config);
  
  await interaction.reply({
    content: `✅ Question added to "${categoryName}"!\n\n**Question ${category.questions.length}:** ${questionText}\n**Type:** ${questionType === 'text' ? 'Text (Paragraph)' : 'Yes/No (Buttons)'}\n\nTotal questions: ${category.questions.length}/20`,
    ephemeral: true
  });
}

// Remove Question Command
async function handleRemoveQuestion(interaction) {
  const config = loadServerConfig(interaction.guildId);
  
  if (!config) {
    return interaction.reply({
      content: '❌ Please run `/setup` first!',
      ephemeral: true
    });
  }
  
  const categoryName = interaction.options.getString('category');
  const questionNumber = interaction.options.getInteger('question_number');
  
  const category = config.categories.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
  
  if (!category) {
    return interaction.reply({
      content: `❌ Category "${categoryName}" not found!`,
      ephemeral: true
    });
  }
  
  if (questionNumber < 1 || questionNumber > category.questions.length) {
    return interaction.reply({
      content: `❌ Invalid question number! Category "${categoryName}" has ${category.questions.length} question(s).`,
      ephemeral: true
    });
  }
  
  const removedQuestion = category.questions[questionNumber - 1];
  category.questions.splice(questionNumber - 1, 1);
  
  saveServerConfig(interaction.guildId, config);
  
  await interaction.reply({
    content: `✅ Question ${questionNumber} removed from "${categoryName}"!\n\n**Removed:** ${removedQuestion.text}\n\nRemaining questions: ${category.questions.length}`,
    ephemeral: true
  });
}

// List Questions Command
async function handleListQuestions(interaction) {
  const config = loadServerConfig(interaction.guildId);
  
  if (!config) {
    return interaction.reply({
      content: '❌ Please run `/setup` first!',
      ephemeral: true
    });
  }
  
  const categoryName = interaction.options.getString('category');
  const category = config.categories.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
  
  if (!category) {
    return interaction.reply({
      content: `❌ Category "${categoryName}" not found!`,
      ephemeral: true
    });
  }
  
  if (category.questions.length === 0) {
    return interaction.reply({
      content: `📝 Category "${categoryName}" has no questions yet.\n\nUse \`/addquestion category:${categoryName}\` to add questions!`,
      ephemeral: true
    });
  }
  
  let questionsList = `**Questions for "${categoryName}"** (${category.questions.length}/20)\n\n`;
  
  category.questions.forEach((q, i) => {
    const typeEmoji = q.type === 'text' ? '📝' : '✅';
    questionsList += `${i + 1}. ${typeEmoji} ${q.text}\n`;
  });
  
  const embed = new EmbedBuilder()
    .setTitle(`❓ ${categoryName} - Questions`)
    .setDescription(questionsList)
    .setColor('#5865F2')
    .setFooter({ text: `Use /addquestion or /removequestion to modify | 📝 = Text | ✅ = Yes/No` });
  
  await interaction.reply({ embeds: [embed], ephemeral: true });
}

// Select Menu Handler
async function handleSelectMenu(interaction) {
  if (interaction.customId === 'application_select') {
    // Acknowledge the interaction immediately to reset the selection state
    await interaction.update({
      components: interaction.message.components
    });
    
    await handleApplicationStart(interaction);
  }
}

// Application Start
async function handleApplicationStart(interaction) {
  const config = loadServerConfig(interaction.guildId);
  const selectedValue = interaction.values[0];
  const categoryName = selectedValue.replace('apply_', '').replace(/_/g, ' ');
  const category = config.categories.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
  
  if (!category) {
    return interaction.followUp({
      content: '❌ Application category not found!',
      ephemeral: true
    });
  }
  
  // Check cooldown
  const cooldownCheck = checkCooldown(interaction.user.id, interaction.guildId, config, interaction.member);
  if (!cooldownCheck.canApply) {
    return interaction.followUp({
      content: `⏰ You must wait ${cooldownCheck.hoursLeft} more hour(s) before submitting another application.`,
      ephemeral: true
    });
  }
  
  // Try to DM user
  try {
    const dmEmbed = new EmbedBuilder()
      .setTitle(`📝 ${category.name} Application`)
      .setDescription(`You are about to start your application for **${category.name}**.\n\nI will ask you ${category.questions.length} questions. Please answer each one carefully.\n\n**Note:** Type your answers in this DM. Type \`cancel\` at any time to stop the application.`)
      .setColor('#5865F2')
      .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL() });
    
    await interaction.user.send({ embeds: [dmEmbed] });
    
    // Initialize application session
    activeApplications.set(interaction.user.id, {
      guildId: interaction.guildId,
      guildName: interaction.guild.name,
      category: category.name,
      answers: [],
      currentQuestion: 0,
      questions: category.questions
    });
    
    // Ask first question
    await askQuestion(interaction.user, category.questions[0], 1, category.questions.length);
    
    await interaction.followUp({
      content: '✅ Check your DMs! I\'ve sent you the application questions.',
      ephemeral: true
    });
  } catch (error) {
    await interaction.followUp({
      content: '❌ I couldn\'t send you a DM. Please enable DMs from server members and try again.',
      ephemeral: true
    });
  }
}

// Ask Question
async function askQuestion(user, question, number, total) {
  if (question.type === 'text') {
    const embed = new EmbedBuilder()
      .setTitle(`Question ${number}/${total}`)
      .setDescription(question.text)
      .setColor('#5865F2')
      .setFooter({ text: 'Type your answer below' });
    
    await user.send({ embeds: [embed] });
  } else if (question.type === 'yes_no') {
    const embed = new EmbedBuilder()
      .setTitle(`Question ${number}/${total}`)
      .setDescription(question.text)
      .setColor('#5865F2')
      .setFooter({ text: 'Click a button below' });
    
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('answer_yes')
          .setLabel('Yes')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('answer_no')
          .setLabel('No')
          .setStyle(ButtonStyle.Danger)
      );
    
    await user.send({ embeds: [embed], components: [row] });
  }
}

// DM Message Handler
client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild === null || message.channel.type !== 1) return;
  
  const session = activeApplications.get(message.author.id);
  if (!session) return;
  
  // Check if user wants to cancel
  if (message.content.toLowerCase() === 'cancel') {
    activeApplications.delete(message.author.id);
    return message.reply('❌ Application cancelled.');
  }
  
  // Only process text answers
  const currentQuestion = session.questions[session.currentQuestion];
  if (currentQuestion.type !== 'text') return;
  
  // Save answer
  session.answers.push({
    question: currentQuestion.text,
    answer: message.content
  });
  
  session.currentQuestion++;
  
  // Check if more questions
  if (session.currentQuestion < session.questions.length) {
    await askQuestion(message.author, session.questions[session.currentQuestion], session.currentQuestion + 1, session.questions.length);
  } else {
    await submitApplication(message.author, session);
  }
});

// Button Handler
async function handleButton(interaction) {
  // Yes/No answer buttons
  if (interaction.customId === 'answer_yes' || interaction.customId === 'answer_no') {
    const session = activeApplications.get(interaction.user.id);
    if (!session) {
      return interaction.reply({ content: '❌ No active application found.', ephemeral: true });
    }
    
    const answer = interaction.customId === 'answer_yes' ? 'Yes' : 'No';
    const currentQuestion = session.questions[session.currentQuestion];
    
    session.answers.push({
      question: currentQuestion.text,
      answer: answer
    });
    
    await interaction.update({ components: [] });
    
    session.currentQuestion++;
    
    if (session.currentQuestion < session.questions.length) {
      await askQuestion(interaction.user, session.questions[session.currentQuestion], session.currentQuestion + 1, session.questions.length);
    } else {
      await submitApplication(interaction.user, session);
    }
  }
  
  // Admin review buttons
  if (interaction.customId.startsWith('app_accept_') || interaction.customId.startsWith('app_deny_')) {
    await handleReviewButton(interaction);
  }
  
  if (interaction.customId.startsWith('app_history_')) {
    await handleHistoryButton(interaction);
  }
  
  if (interaction.customId.startsWith('app_ticket_')) {
    await handleTicketButton(interaction);
  }
}

// Submit Application
async function submitApplication(user, session) {
  const config = loadServerConfig(session.guildId);
  const applications = loadApplications(session.guildId);
  
  const logChannelId = config.logChannelId;
  const logChannel = await client.guilds.cache.get(session.guildId).channels.fetch(logChannelId).catch(() => null);
  
  if (!logChannel) {
    console.error('Log channel not found!');
    return;
  }

  // Build application content
  let appContent = `**New Application Received!**\n\n`;
  appContent += `**Applicant:** ${user} (${user.id})\n`;
  appContent += `**Category:** ${session.category}\n`;
  appContent += `**Submitted:** <t:${Math.floor(Date.now() / 1000)}:R>\n\n`;
  
  session.answers.forEach((ans, i) => {
    appContent += `**${i + 1}. ${ans.question}**\n${ans.answer || 'No answer'}\n\n`;
  });

  // Handle character limit (4096 for embed description)
  const chunks = [];
  let currentChunk = '';
  
  const lines = appContent.split('\n');
  for (const line of lines) {
    if ((currentChunk + line).length > 3900) {
      chunks.push(currentChunk);
      currentChunk = '';
    }
    currentChunk += line + '\n';
  }
  if (currentChunk) chunks.push(currentChunk);

  const applicationId = Date.now().toString().slice(-8);
  
  let firstMessage = null;
  for (let i = 0; i < chunks.length; i++) {
    const embed = new EmbedBuilder()
      .setTitle(`📋 ${session.category} Application - ${user.username}`)
      .setDescription(chunks[i])
      .setColor('#5865F2')
      .setFooter({ text: `ID: ${applicationId}${chunks.length > 1 ? ` (Part ${i + 1}/${chunks.length})` : ''}` })
      .setTimestamp();

    const components = [];
    if (i === chunks.length - 1) {
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder().setCustomId(`app_accept_${applicationId}`).setLabel('Accept').setStyle(ButtonStyle.Success).setEmoji('✅'),
          new ButtonBuilder().setCustomId(`app_deny_${applicationId}`).setLabel('Deny').setStyle(ButtonStyle.Danger).setEmoji('❌'),
          new ButtonBuilder().setCustomId(`app_history_${user.id}`).setLabel('History').setStyle(ButtonStyle.Secondary).setEmoji('📋'),
          new ButtonBuilder().setCustomId(`app_ticket_${applicationId}`).setLabel('Open Ticket').setStyle(ButtonStyle.Primary).setEmoji('🎫')
        );
      components.push(row);
    }

    const msg = await logChannel.send({ embeds: [embed], components });
    if (i === 0) firstMessage = msg;
  }

  // Save application
  applications.push({
    id: applicationId,
    userId: user.id,
    userTag: user.tag,
    category: session.category,
    answers: session.answers,
    status: 'pending',
    timestamp: Date.now(),
    messageId: firstMessage ? firstMessage.id : null,
    channelId: logChannel.id
  });
  saveApplications(session.guildId, applications);
  
  // Update cooldown
  setCooldown(user.id, session.guildId);
  
  // Notify user
  const successEmbed = new EmbedBuilder()
    .setTitle('✅ Application Submitted!')
    .setDescription(`Your application for **${session.category}** has been submitted successfully!\n\nOur team will review it and get back to you soon.\n\n**Server:** ${session.guildName}`)
    .setColor('#00FF00')
    .setFooter({ text: `Application ID: ${applicationId}` })
    .setTimestamp();
  
  await user.send({ embeds: [successEmbed] });
  
  // Clean up session
  activeApplications.delete(user.id);
}

// Review Button Handler
async function handleReviewButton(interaction) {
  const config = loadServerConfig(interaction.guildId);
  
  if (!isAdmin(interaction.member, config)) {
    return interaction.reply({
      content: '❌ You do not have permission to review applications.',
      ephemeral: true
    });
  }
  
  const action = interaction.customId.startsWith('app_accept_') ? 'accept' : 'deny';
  const applicationId = interaction.customId.replace(`app_${action}_`, '');
  
  const modal = new ModalBuilder()
    .setCustomId(`review_${action}_${applicationId}`)
    .setTitle(`${action === 'accept' ? 'Accept' : 'Deny'} Application`);
  
  const reasonInput = new TextInputBuilder()
    .setCustomId('reason')
    .setLabel('Reason (will be sent to applicant)')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setPlaceholder(action === 'accept' ? 'Welcome to the team! You showed great...' : 'Unfortunately, we cannot accept your application because...');
  
  modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));
  
  await interaction.showModal(modal);
}

// History Button Handler
async function handleHistoryButton(interaction) {
  const config = loadServerConfig(interaction.guildId);
  
  if (!isAdmin(interaction.member, config)) {
    return interaction.reply({
      content: '❌ You do not have permission to view application history.',
      ephemeral: true
    });
  }
  
  const userId = interaction.customId.replace('app_history_', '');
  const applications = loadApplications(interaction.guildId);
  const userApps = applications.filter(app => app.userId === userId);
  
  if (userApps.length === 0) {
    return interaction.reply({
      content: '📋 No application history found for this user.',
      ephemeral: true
    });
  }
  
  let historyText = `**Application History for <@${userId}>**\n\n`;
  
  userApps.forEach((app, i) => {
    const statusEmoji = app.status === 'accepted' ? '✅' : app.status === 'denied' ? '❌' : '⏳';
    historyText += `${i + 1}. ${statusEmoji} **${app.category}** - <t:${Math.floor(app.timestamp / 1000)}:D>\n`;
    historyText += `   Status: ${app.status}\n`;
    if (app.reviewedBy) historyText += `   Reviewed by: <@${app.reviewedBy}>\n`;
    historyText += `\n`;
  });
  
  const embed = new EmbedBuilder()
    .setTitle('📋 Application History')
    .setDescription(historyText)
    .setColor('#5865F2');
  
  await interaction.reply({ embeds: [embed], ephemeral: true });
}

// Ticket Button Handler
async function handleTicketButton(interaction) {
  const config = loadServerConfig(interaction.guildId);
  
  if (!isAdmin(interaction.member, config)) {
    return interaction.reply({
      content: '❌ You do not have permission to open tickets.',
      ephemeral: true
    });
  }
  
  if (!config.ticketCategoryId) {
    return interaction.reply({
      content: '❌ Ticket category not set. Use `/setticketcategory` first!',
      ephemeral: true
    });
  }
  
  const applicationId = interaction.customId.replace('app_ticket_', '');
  const applications = loadApplications(interaction.guildId);
  const application = applications.find(app => app.id === applicationId);
  
  if (!application) {
    return interaction.reply({
      content: '❌ Application not found!',
      ephemeral: true
    });
  }
  
  await interaction.deferReply({ ephemeral: true });
  
  try {
    const user = await client.users.fetch(application.userId);
    const ticketName = `ticket-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    
    // Check if ticket already exists
    const channels = await interaction.guild.channels.fetch();
    const existingTicket = channels.find(c => c.name === ticketName && c.parentId === config.ticketCategoryId);
    
    if (existingTicket) {
      return interaction.editReply({
        content: `❌ A ticket is already open for this user: ${existingTicket}`
      });
    }
    
    const ticketChannel = await interaction.guild.channels.create({
      name: ticketName,
      type: ChannelType.GuildText,
      parent: config.ticketCategoryId,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: user.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
        },
        ...config.adminRoleIds.map(roleId => ({
          id: roleId,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
        }))
      ]
    });
    
    const ticketEmbed = new EmbedBuilder()
      .setTitle('🎫 Application Ticket')
      .setDescription(`Hello ${user}!\n\nThis ticket has been opened regarding your **${application.category}** application.\n\nAn admin will be with you shortly to discuss your application.`)
      .setColor('#5865F2')
      .setTimestamp();
    
    await ticketChannel.send({ content: `${user} ${config.adminRoleIds.map(id => `<@&${id}>`).join(' ')}`, embeds: [ticketEmbed] });
    
    await interaction.editReply({
      content: `✅ Ticket created: ${ticketChannel}`
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    await interaction.editReply({
      content: '❌ Failed to create ticket. Please check bot permissions.'
    });
  }
}

// Modal Handler
async function handleModal(interaction) {
  if (interaction.customId.startsWith('review_accept_') || interaction.customId.startsWith('review_deny_')) {
    await handleReviewModal(interaction);
  } else if (interaction.customId.startsWith('edit_questions_')) {
    await handleEditQuestionsModal(interaction);
  }
}

// Review Modal Handler
async function handleReviewModal(interaction) {
  const action = interaction.customId.includes('accept') ? 'accept' : 'deny';
  const applicationId = interaction.customId.replace(`review_${action}_`, '');
  const reason = interaction.fields.getTextInputValue('reason');
  
  const applications = loadApplications(interaction.guildId);
  const application = applications.find(app => app.id === applicationId);
  
  if (!application) {
    return interaction.reply({
      content: '❌ Application not found!',
      ephemeral: true
    });
  }
  
  // Update application
  application.status = action === 'accept' ? 'accepted' : 'denied';
  application.reviewedBy = interaction.user.id;
  application.reason = reason;
  saveApplications(interaction.guildId, applications);
  
  // Update embed
  const originalEmbed = EmbedBuilder.from(interaction.message.embeds[0]);
  originalEmbed.setColor(action === 'accept' ? '#00FF00' : '#FF0000');
  originalEmbed.addFields(
    { name: '📊 Status', value: action === 'accept' ? '✅ Accepted' : '❌ Denied', inline: true },
    { name: '👤 Reviewed By', value: `${interaction.user.tag}`, inline: true },
    { name: '📝 Reason', value: reason }
  );
  
  await interaction.message.edit({ embeds: [originalEmbed], components: [] });
  
  // Defer the reply to avoid interaction timeout
  await interaction.deferReply({ ephemeral: true });
  
  // DM user
  try {
    const userObj = await client.users.fetch(application.userId);
    const dmEmbed = new EmbedBuilder()
      .setTitle(`${action === 'accept' ? '✅ Application Accepted!' : '❌ Application Denied'}`)
      .setDescription(`Your application for **${application.category}** has been **${action === 'accept' ? 'accepted' : 'denied'}**.\n\n**Reason:**\n${reason}`)
      .setColor(action === 'accept' ? '#00FF00' : '#FF0000')
      .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
      .setTimestamp();
    
    await userObj.send({ embeds: [dmEmbed] });
    
    // Delete ticket channel if it exists
    const ticketName = `ticket-${userObj.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    const channels = await interaction.guild.channels.fetch();
    const config = loadServerConfig(interaction.guildId);
    const ticketChannel = channels.find(c => c.name === ticketName && c.parentId === config.ticketCategoryId);
    
    if (ticketChannel) {
      await ticketChannel.delete('Application processed').catch(console.error);
    }
    
    // Auto-role assignment if accepted
    if (action === 'accept') {
      const category = config.categories.find(cat => cat.name === application.category);
      
      if (category && (category.roleId || category.roleIds)) {
        try {
          const member = await interaction.guild.members.fetch(application.userId);
          const roleIdsToAssign = category.roleIds || (category.roleId ? [category.roleId] : []);
          
          for (const roleId of roleIdsToAssign) {
            await member.roles.add(roleId).catch(err => console.error(`Failed to assign role ${roleId}:`, err));
          }
          
          if (roleIdsToAssign.length > 0) {
            await userObj.send(`🎭 You have been assigned the roles for **${category.name}**!`);
          }
        } catch (error) {
          console.error('Error assigning roles:', error);
        }
      }
    }
  } catch (error) {
    console.error('Error processing application result:', error);
  }
  
  await interaction.editReply({
    content: `✅ Application ${action === 'accept' ? 'accepted' : 'denied'} and user has been notified!`
  });
}

// Edit Questions Modal Handler
async function handleEditQuestionsModal(interaction) {
  const categoryName = interaction.customId.replace('edit_questions_', '');
  const config = loadServerConfig(interaction.guildId);
  const category = config.categories.find(cat => cat.name === categoryName);
  
  if (!category) {
    return interaction.reply({
      content: '❌ Category not found!',
      ephemeral: true
    });
  }
  
  // Update questions
  const newQuestions = [];
  const totalQuestionsDisplayed = Math.min(5, category.questions.length);
  for (let i = 0; i < totalQuestionsDisplayed; i++) {
    const value = interaction.fields.getTextInputValue(`question_${i}`);
    if (value && value.trim()) {
      newQuestions.push({ text: value.trim(), type: 'text' });
    }
  }
  
  // If there were more than 5 questions, preserve the rest
  if (category.questions.length > 5) {
    newQuestions.push(...category.questions.slice(5));
  }
  
  if (newQuestions.length === 0) {
    return interaction.reply({
      content: '❌ You must provide at least one question!',
      ephemeral: true
    });
  }
  
  category.questions = newQuestions;
  saveServerConfig(interaction.guildId, config);
  
  await interaction.reply({
    content: `✅ Questions updated for **${categoryName}**! (${newQuestions.length} questions)`,
    ephemeral: true
  });
}

// Start the bot
client.login(process.env.DISCORD_TOKEN).catch(err => {
  console.error('CRITICAL: Failed to login to Discord:', err);
  process.exit(1);
});

// Pending Applications Command
async function handlePendingApplications(interaction) {
  const config = loadServerConfig(interaction.guildId);
  const applications = loadApplications(interaction.guildId);
  const pendingApps = applications.filter(app => app.status === 'pending');
  
  if (pendingApps.length === 0) {
    return interaction.reply({ content: '✅ No pending applications!', ephemeral: true });
  }
  
  let listText = `**Total Pending Applications: ${pendingApps.length}**\n\n`;
  
  pendingApps.forEach((app, i) => {
    const link = (app.messageId && app.channelId) ? `[Jump to Message](https://discord.com/channels/${interaction.guildId}/${app.channelId}/${app.messageId})` : 'Link unavailable';
    listText += `${i + 1}. **${app.category}** - <@${app.userId}> (ID: \`${app.id}\`)\n   ${link}\n\n`;
  });

  // Handle potential length limits
  if (listText.length > 4000) {
    listText = listText.substring(0, 3900) + '\n... and more pending applications.';
  }

  const embed = new EmbedBuilder()
    .setTitle('📋 Pending Applications')
    .setDescription(listText)
    .setColor('#FFA500')
    .setTimestamp();
    
  await interaction.reply({ embeds: [embed], ephemeral: true });
}
