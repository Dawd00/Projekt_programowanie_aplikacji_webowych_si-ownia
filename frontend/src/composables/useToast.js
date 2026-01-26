import { ref } from 'vue'

const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
  timeout: 3000,
})

export const useToast = () => {
  const showToast = (message, type = 'success') => {
    snackbar.value = {
      show: true,
      text: message,
      color: type === 'success' ? 'success' : type === 'error' ? 'error' : 'info',
      timeout: 3000,
    }
  }

  const showSuccess = (message) => showToast(message, 'success')
  const showError = (message) => showToast(message, 'error')
  const showInfo = (message) => showToast(message, 'info')

  return {
    snackbar,
    showToast,
    showSuccess,
    showError,
    showInfo,
  }
}

