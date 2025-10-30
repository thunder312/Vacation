<template>
  <div>
    <Navbar v-if="$auth.loggedIn" />
    <nuxt />
  </div>
</template>

<script>
import Navbar from '~/components/Navbar.vue'

export default {
  components: {
    Navbar
  }
}
</script>