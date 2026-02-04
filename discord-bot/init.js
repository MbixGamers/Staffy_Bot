require('dotenv').config();
const { REST, Routes } = require('discord.js');

const commands = [
  {
    name: 'help',
    description: 'Show all available commands and how to use them'
  },
  {
    name: 'setup',
    description: 'Initial bot setup for this server (Admin only)',
    options: [
      {
        name: 'log_channel',
        description: 'Channel where applications will be sent',
        type: 7,
        required: true
      },
      {
        name: 'admin_role',
        description: 'First admin role that can review applications',
        type: 8,
        required: true
      }
    ]
  },
  {
    name: 'addadminrole',
    description: 'Add an additional admin role (Admin only)',
    options: [
      {
        name: 'role',
        description: 'Role to add as admin',
        type: 8,
        required: true
      }
    ]
  },
  {
    name: 'removeadminrole',
    description: 'Remove an admin role (Admin only)',
    options: [
      {
        name: 'role',
        description: 'Role to remove from admin list',
        type: 8,
        required: true
      }
    ]
  },
  {
    name: 'panel',
    description: 'Deploy the application panel',
    options: [
      {
        name: 'channel',
        description: 'Channel to send the panel (optional, defaults to current)',
        type: 7,
        required: false
      }
    ]
  },
  {
    name: 'addcategory',
    description: 'Add a new application category (Admin only)',
    options: [
      {
        name: 'name',
        description: 'Category name (e.g., Moderator, HR)',
        type: 3,
        required: true
      },
      {
        name: 'description',
        description: 'Short description of this role',
        type: 3,
        required: true
      },
      {
        name: 'role1',
        description: 'First role to assign on acceptance (optional)',
        type: 8,
        required: false
      },
      {
        name: 'role2',
        description: 'Second role to assign on acceptance (optional)',
        type: 8,
        required: false
      },
      {
        name: 'role3',
        description: 'Third role to assign on acceptance (optional)',
        type: 8,
        required: false
      },
      {
        name: 'role4',
        description: 'Fourth role to assign on acceptance (optional)',
        type: 8,
        required: false
      }
    ]
  },
  {
    name: 'editquestions',
    description: 'Edit questions for a category (Admin only)',
    options: [
      {
        name: 'category',
        description: 'Category to edit',
        type: 3,
        required: true
      }
    ]
  },
  {
    name: 'removecategory',
    description: 'Remove an application category (Admin only)',
    options: [
      {
        name: 'category',
        description: 'Category name to remove',
        type: 3,
        required: true
      }
    ]
  },
  {
    name: 'setlogchannel',
    description: 'Set or update the log channel (Admin only)',
    options: [
      {
        name: 'channel',
        description: 'New log channel',
        type: 7,
        required: true
      }
    ]
  },
  {
    name: 'setticketcategory',
    description: 'Set the category for ticket channels (Admin only)',
    options: [
      {
        name: 'category',
        description: 'Category where ticket channels will be created',
        type: 7,
        required: true
      }
    ]
  },
  {
    name: 'viewconfig',
    description: 'View current server configuration (Admin only)'
  },
  {
    name: 'setcooldown',
    description: 'Set application cooldown in hours (Admin only)',
    options: [
      {
        name: 'hours',
        description: 'Cooldown in hours (default: 24)',
        type: 4,
        required: true
      }
    ]
  },
  {
    name: 'addquestion',
    description: 'Add a question to a category (Admin only)',
    options: [
      {
        name: 'category',
        description: 'Category to add question to',
        type: 3,
        required: true
      },
      {
        name: 'question',
        description: 'The question text',
        type: 3,
        required: true
      },
      {
        name: 'type',
        description: 'Question type',
        type: 3,
        required: true,
        choices: [
          {
            name: 'Text (Paragraph answer)',
            value: 'text'
          },
          {
            name: 'Yes/No (Button choice)',
            value: 'yes_no'
          }
        ]
      }
    ]
  },
  {
    name: 'removequestion',
    description: 'Remove a question from a category (Admin only)',
    options: [
      {
        name: 'category',
        description: 'Category to remove question from',
        type: 3,
        required: true
      },
      {
        name: 'question_number',
        description: 'Question number to remove (1-20)',
        type: 4,
        required: true
      }
    ]
  },
  {
    name: 'listquestions',
    description: 'List all questions for a category (Admin only)',
    options: [
      {
        name: 'category',
        description: 'Category to view questions for',
        type: 3,
        required: true
      }
    ]
  },
  {
    name: 'pendingapplications',
    description: 'List all pending applications (Admin only)'
  }
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands globally.');
  } catch (error) {
    console.error(error);
  }
})();