<template>
  <div>
    <h1>Willkommen auf der Hauptseite</h1>
    <p>Sie sind eingeloggt als {{ $auth.user.username }}</p>
  </div>
</template>

<script>
export default {
  middleware: 'auth'
}
</script>
