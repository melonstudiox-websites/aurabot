import { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, TextInputBuilder, TextInputStyle, ModalBuilder } from 'discord.js';
import { FONTS, WRAPPERS } from '../config.js';

export function createDashboard() {
  const auraMenu = new StringSelectMenuBuilder()
    .setCustomId('select_aura')
    .setPlaceholder('Select aura preset')
    .addOptions([
      { label: 'Divine', value: 'divine' },
      { label: 'Royal', value: 'royal' },
      { label: 'Elite', value: 'elite' },
      { label: 'Minimal', value: 'minimal' },
      { label: 'Muted', value: 'muted' }
    ]);

  const fontMenu = new StringSelectMenuBuilder()
    .setCustomId('select_font')
    .setPlaceholder('Select font style')
    .addOptions(FONTS.map(f=>({label:f,value:f})));

  const wrapperMenu = new StringSelectMenuBuilder()
    .setCustomId('select_wrapper')
    .setPlaceholder('Select wrapper style')
    .addOptions(WRAPPERS.map(w=>({label:`${w[0]} ... ${w[1]}`,value:JSON.stringify(w)})));

  const featureMenu = new StringSelectMenuBuilder()
    .setCustomId('select_feature')
    .setPlaceholder('Select server features')
    .setMinValues(0)
    .setMaxValues(5)
    .addOptions([
      { label:'Voice Channels', value:'voice' },
      { label:'Event Channels', value:'events' },
      { label:'Invite Music Bot', value:'music' },
      { label:'Invite Leveling Bot', value:'leveling' },
      { label:'Custom Permissions', value:'perms' }
    ]);

  const aiMenu = new StringSelectMenuBuilder()
    .setCustomId('select_ai')
    .setPlaceholder('AI auto-generate server?')
    .addOptions([{label:'Yes',value:'yes'},{label:'No',value:'no'}]);

  const row1 = new ActionRowBuilder().addComponents(auraMenu);
  const row2 = new ActionRowBuilder().addComponents(fontMenu);
  const row3 = new ActionRowBuilder().addComponents(wrapperMenu);
  const row4 = new ActionRowBuilder().addComponents(featureMenu);
  const row5 = new ActionRowBuilder().addComponents(aiMenu);

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('confirm_build').setLabel('Confirm Build').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('cancel_build').setLabel('Cancel').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('prompt_extra').setLabel('Extra Prompt').setStyle(ButtonStyle.Primary)
  );

  return { components:[row1,row2,row3,row4,row5,buttons] };
}

export function createPreviewEmbed(selections) {
  return new EmbedBuilder()
    .setTitle('Server Build Preview')
    .setColor(0x38BDF8)
    .addFields(
      {name:'Aura Preset',value: selections.aura||'None',inline:true},
      {name:'Font',value: selections.font||'None',inline:true},
      {name:'Wrapper',value: selections.wrapper?JSON.stringify(selections.wrapper):'None',inline:true},
      {name:'Features',value: selections.features?.join(', ')||'None',inline:true},
      {name:'AI Generate',value: selections.aiGenerate?'Yes':'No',inline:true},
      {name:'Extra Prompt',value: selections.extraPrompt||'None'}
    )
    .setDescription('Click Confirm Build to create your server.');
}

