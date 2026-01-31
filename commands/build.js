import { SlashCommandBuilder } from 'discord.js';
import { createDashboard, createPreviewEmbed } from '../components/buildDashboard.js';

export const data = new SlashCommandBuilder()
  .setName('build')
  .setDescription('Interactive AI-powered server builder');

export async function execute(interaction) {
  // Check if command is used inside a server
  if (!interaction.guild) {
    return interaction.reply({
      content: '❌ This command can only be used in a server.',
      ephemeral: true
    });
  }

  // Only server owner can run the command
  if (interaction.user.id !== interaction.guild.ownerId) {
    return interaction.reply({
      content: '❌ Only the server owner can run this.',
      ephemeral: true
    });
  }

  try {
    // Defer reply to prevent timeout
    await interaction.deferReply({ ephemeral: true });

    // Create dashboard
    const dashboard = createDashboard();

    // Send the preview embed + interactive components
    await interaction.editReply({
      embeds: [createPreviewEmbed({})],
      components: dashboard.components
    });

  } catch (err) {
    console.error('Error executing /build:', err);
    await interaction.editReply({
      content: '❌ An error occurred while generating the dashboard.',
      components: []
    });
  }
}
