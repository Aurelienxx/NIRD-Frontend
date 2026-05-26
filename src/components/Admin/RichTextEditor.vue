<template>
  <div class="rich-text-editor">
    <div class="toolbar">
      <!-- Groupe Mise en forme -->
      <button type="button" @click="editor?.chain().focus().toggleBold().run()" :class="{ active: editor?.isActive('bold') }"><strong>B</strong></button>
      <button type="button" @click="editor?.chain().focus().toggleItalic().run()" :class="{ active: editor?.isActive('italic') }"><em>I</em></button>
      <button type="button" @click="editor?.chain().focus().toggleUnderline().run()" :class="{ active: editor?.isActive('underline') }"><u>U</u></button>

      <div class="toolbar-divider"></div>

      <!-- Groupe Titres -->
      <button type="button" @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()" :class="{ active: editor?.isActive('heading', { level: 1 }) }">H1</button>
      <button type="button" @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ active: editor?.isActive('heading', { level: 2 }) }">H2</button>
      <button type="button" @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()" :class="{ active: editor?.isActive('heading', { level: 3 }) }">H3</button>

      <div class="toolbar-divider"></div>

      <!-- Groupe Listes -->
      <button type="button" @click="editor?.chain().focus().toggleBulletList().run()" :class="{ active: editor?.isActive('bulletList') }">≡</button>
      <button type="button" @click="editor?.chain().focus().toggleOrderedList().run()" :class="{ active: editor?.isActive('orderedList') }">1.</button>
      <button type="button" @click="setLink" :class="{ active: editor?.isActive('link') }"title="Ajouter un lien">🔗</button>
      <button type="button" v-if="editor?.isActive('link')"@click="editor?.chain().focus().unsetLink().run()"title="Supprimer le lien">❌</button>

      <div class="toolbar-divider"></div>

      <!-- Groupe Historique -->
      <button type="button" @click="editor?.chain().focus().undo().run()">↶</button>
      <button type="button" @click="editor?.chain().focus().redo().run()">↷</button>

      <div class="toolbar-divider"></div>

      <!-- Bouton de sauvegarde manuel -->
      <button type="button" class="btn-manual-save" @click="triggerManualSave">
        💾 Enregistrer
      </button>
    </div>

    <editor-content :editor="editor" class="editor-content" />

    <div class="editor-footer">
      <div class="word-count">{{ editor?.storage.characterCount?.characters() || 0 }} caractères</div>
      <div class="hint"><strong>Ctrl + S</strong> pour enregistrer rapidement</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import CharacterCount from '@tiptap/extension-character-count';

const props = defineProps({
  modelValue: String
});

const emit = defineEmits(['update:modelValue', 'save']);

const editor = useEditor({
  extensions: [
    StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
    Underline,
    CharacterCount.configure({ limit: 50000 }),
  ],
  content: props.modelValue || '',
  // CETTE PARTIE EST VITALE :
  // À chaque touche pressée, le HTML du parent (editingPage.layout) est mis à jour.
  onUpdate: ({ editor }) => {
    const html = editor.getHTML();
    emit('update:modelValue', html);
  },
});

// IMPORTANT : On surveille le changement de page (quand l'utilisateur clique sur une autre page)
watch(() => props.modelValue, (newValue) => {
  // On récupère le contenu actuel de l'éditeur
  const isSame = editor.value?.getHTML() === newValue;
  
  // Si le contenu est identique, on ne fait RIEN (pour ne pas casser l'écriture)
  if (isSame) return;

  // Si c'est différent (changement de page), on charge le nouveau contenu
  editor.value?.commands.setContent(newValue || '');
});

const triggerManualSave = () => {
  if (editor.value) {
    const content = editor.value.getHTML();
    emit('update:modelValue', content); // Synchro locale
    emit('save', content);              // Déclenche le savePage(content) du parent
  }
};

const handleKeyDown = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault();
    triggerManualSave();
  }
};

const setLink = () => {
  if (!editor.value) return;

  const previousUrl = editor.value.getAttributes('link').href;
  const url = window.prompt('URL du lien :', previousUrl);

  if (url === null) return;

  if (url === '') {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run();
    return;
  }

  editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
};

onMounted(() => window.addEventListener('keydown', handleKeyDown));
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
  // On détruit l'éditeur proprement pour libérer la mémoire
  editor.value?.destroy();
});
</script>

<style scoped>
.rich-text-editor {
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
  background: var(--background-2);
}

.toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  padding: 10px;
  background: var(--background-1);
  border-bottom: 1px solid #e9ecef;
}

.toolbar button {
  padding: 6px 10px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toolbar button:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.toolbar button.active {
  background: #007bff;
  color: white;
  border-color: #0056b3;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: #ddd;
  margin: 0 4px;
}

.btn-manual-save {
  margin-left: auto;
  background: #28a745 !important;
  color: white !important;
  border: none !important;
  padding: 0 10px !important;
  font-size: 12px !important;
  border-radius: 4px !important;
}

.btn-manual-save:hover {
  background: #218838 !important;
}

.editor-content {
  min-height: 300px;
  max-height: 500px;
  overflow-y: auto;
  padding: 15px;
}

.editor-content :deep(.ProseMirror) {
  outline: none;
}

.editor-content :deep(.ProseMirror p) {
  margin: 15px 0;
  line-height: 1.6;
  color: var(--text-light);
}

.editor-content :deep(.ProseMirror h1) {
  font-size: 28px;
  font-weight: 700;
  margin: 20px 0 10px 0;
  line-height: 1.3;
  color: var(--text-white);
}

.editor-content :deep(.ProseMirror h2) {
  font-size: 22px;
  font-weight: 700;
  margin: 18px 0 10px 0;
  line-height: 1.3;
  color: var(--text-white);
}

.editor-content :deep(.ProseMirror h3) {
  font-size: 18px;
  font-weight: 700;
  margin: 15px 0 8px 0;
  line-height: 1.3;
  color: var(--text-white);
}

.editor-content :deep(.ProseMirror ul),
.editor-content :deep(.ProseMirror ol) {
  margin: 15px 0;
  padding-left: 30px;
}

.editor-content :deep(.ProseMirror li) {
  margin: 5px 0;
  line-height: 1.6;
  color: var(--text-light);
}

.editor-content :deep(.ProseMirror blockquote) {
  margin: 15px 0;
  padding: 10px 15px;
  border-left: 3px solid #007bff;
  background: #f0f7ff;
  color: #333;
  font-style: italic;
}

.editor-content :deep(.ProseMirror hr) {
  margin: 20px 0;
  border: none;
  border-top: 1px solid #ddd;
}

.editor-content :deep(.ProseMirror strong) {
  font-weight: 700;
  color: var(--text-white);
}

.editor-content :deep(.ProseMirror em) {
  font-style: italic;
}

.editor-content :deep(.ProseMirror u) {
  text-decoration: underline;
}

.editor-content :deep(.ProseMirror a) {
  color: #007bff;
  text-decoration: underline;
  cursor: pointer;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 15px;
  background: var(--background-1);
  border-top: 1px solid #e9ecef;
  font-size: 12px;
  color: var(--text-light);
}

.word-count {
  font-size: 12px;
  color: var(--text-light);
}

.hint {
  font-size: 11px;
  color: #666;
}

@media (max-width: 768px) {
  .toolbar {
    gap: 2px;
  }

  .toolbar button {
    padding: 4px 8px;
    min-width: 28px;
    height: 28px;
    font-size: 12px;
  }

  .editor-content {
    min-height: 200px;
    max-height: 300px;
  }
}
</style>
