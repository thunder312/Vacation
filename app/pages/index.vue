<template>
  <div class="home-container">
    <div class="welcome-box">
      <div class="icon">✓</div>
      <h1>Erfolgreich eingeloggt!</h1>
      <p>Willkommen zurück. Dein Login war erfolgreich.</p>

      <div class="info-section">
        <div class="info-card">
          <h3>Dashboard</h3>
          <p>Hier könnte dein Dashboard sein</p>
        </div>

        <div class="info-card">
          <h3>Profil</h3>
          <p>Verwalte deine Einstellungen</p>
        </div>

        <div class="info-card">
          <h3>Einstellungen</h3>
          <p>Passe deine Präferenzen an</p>
        </div>
      </div>

      <button @click="logout" class="logout-btn">Abmelden</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const logout = () => {
  navigateTo('/login')
}
</script>

<style scoped>
.home-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.welcome-box {
  background: white;
  padding: 3rem;
  border-radius: 15px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  text-align: center;
  max-width: 800px;
  width: 100%;
}

.icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  margin: 0 auto 1.5rem;
  animation: scaleIn 0.5s ease-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

h1 {
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 2rem;
}

p {
  color: #666;
  margin-bottom: 2.5rem;
  font-size: 1.1rem;
}

.info-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.info-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 10px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.info-card h3 {
  color: #667eea;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.info-card p {
  color: #888;
  font-size: 0.9rem;
  margin: 0;
}

.logout-btn {
  padding: 0.75rem 2.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.logout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

@media (max-width: 768px) {
  .welcome-box {
    padding: 2rem;
  }

  .info-section {
    grid-template-columns: 1fr;
  }
}
</style>