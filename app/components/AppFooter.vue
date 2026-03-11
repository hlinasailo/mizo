<!-- components/AppFooter.vue -->
<template>
<footer class="border-t border-zinc-900 bg-black pt-20 pb-10">

  <div class="max-w-7xl mx-auto px-6 lg:px-12">

    <!-- Grid -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">

      <!-- Brand -->
       
    <div class="md:col-span-2 flex gap-4">

  <!-- Logo -->
  <div class="w-10 h-10 bg-white flex items-center justify-center font-black text-black tracking-widest text-sm border border-white mt-1">
    M
  </div>

  <!-- Text block -->
  <div class="flex flex-col">
    
    <h2 class="font-sans font-black tracking-tighter leading-none uppercase text-3xl text-white">
      MIZOMADE
    </h2>

    <p class="text-zinc-400 text-base mt-3 leading-relaxed max-w-base">
      Pe rawh u, tichuan pekin in awm ang.<br>
      Give, and it will be given to you.
    </p>

  </div>

</div>

      <!-- Explore -->
      <div>
        <h3 class="text-white font-bold mb-6 uppercase tracking-widest text-xl">
          EXPLORE
        </h3>

        <ul class="space-y-3 text-base text-zinc-500">
          <li v-for="link in directoryLinks" :key="link.text">
            <NuxtLink
              :to="link.url"
              class="hover:text-white transition-colors"
            >
              {{ link.text }}
            </NuxtLink>
          </li>
        </ul>
      </div>

      <!-- Legal -->
      <div>
        <h3 class="text-white font-bold mb-6 uppercase tracking-widest text-xl">
          LEGAL
        </h3>

        <ul class="space-y-3 text-base text-zinc-500">
          <li v-for="link in legalLinks" :key="link.text">
            <NuxtLink
              :to="link.url"
              class="hover:text-white transition-colors"
            >
              {{ link.text }}
            </NuxtLink>
          </li>
        </ul>
      </div>

      <!-- Support -->
      <div>
        <h3 class="text-white font-bold mb-6 uppercase tracking-widest text-xl">
          SUPPORT
        </h3>

        <ul class="space-y-3 text-base text-zinc-500">
          <li v-for="link in supportLinks" :key="link.text">
            <NuxtLink
              :to="link.url"
              class="hover:text-white transition-colors"
            >
              {{ link.text }}
            </NuxtLink>
          </li>
        </ul>
      </div>

      <!-- Contact -->
      <div>
        <h3 class="text-white font-bold mb-6 uppercase tracking-widest text-xl">
          CONTACT
        </h3>

        <ul class="space-y-3 text-base text-zinc-500">

          <li v-for="link in ContactLinks" :key="link.text">

            <!-- Normal Links -->
            <NuxtLink
              v-if="link.type === 'link'"
              :to="link.url"
              class="hover:text-white transition-colors"
            >
              {{ link.text }}
            </NuxtLink>

            <!-- Button -->
            <NuxtLink
              v-else
              :to="link.url"
              class="inline-block px-4 py-2 bg-white text-black text-base rounded hover:bg-zinc-200 transition"
            >
              {{ link.text }}
            </NuxtLink>

          </li>

        </ul>
      </div>

    </div>



  </div>

</footer>
</template>

<script setup>
const directoryLinks = [
  { text: 'Landing', url: '/index' },
  { text: 'Blog', url: '/blogs' },
  { text: 'Service', url: '/ServicesPage' },
  { text: 'Company', url: '/CompanyPage' }
]

const legalLinks = [
  { text: 'Privacy Policy', url: '/privacy' },
  { text: 'Terms of Use', url: '/Terms' },
  { text: 'Disclaimer', url: '/Disclaimer' }
]

const supportLinks = [
  { text: 'About', url: '/about' },
  { text: 'How to', url: '/howto' }
]

const ContactLinks = [
  { text: 'mizomade.official@gmail.com', url: 'mailto:mizomade.official@gmail.com', type: 'link' },
  { text: '+91 6009229392', url: 'tel:+916009229392', type: 'link' },
  { text: 'Contact Us', url: '/mail', type: 'button' }
]
</script>
