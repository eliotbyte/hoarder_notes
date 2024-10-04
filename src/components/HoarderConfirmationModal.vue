<!-- ./src/components/ConfirmationModal.vue -->

<template>
  <div class="modal">
    <div
      class="confirmation-content bg-noteBackground text-textColor rounded-md p-4"
    >
      <p class="text-textColor mb-4">
        Are you sure you want to discard your changes?
      </p>
      <div class="flex justify-end space-x-2">
        <button
          class="bg-gray-500 text-white px-4 py-2 rounded-md"
          @click="$emit('cancel')"
        >
          Cancel
        </button>
        <button
          class="bg-red-500 text-white px-4 py-2 rounded-md"
          @click="$emit('confirm')"
        >
          Discard
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  emits: ['cancel', 'confirm'],
}
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.confirmation-content {
  width: 400px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  background-color: var(--note-background-color);
  color: var(--text-color);
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
  user-select: none;
}
</style>
