<template>
  <UHeader :toggle="false">
    <template #left>
      <NuxtLink to="/">
        <AppLogo class="w-auto h-6 shrink-0" />
      </NuxtLink>

      <TemplateMenu />
    </template>

    <template #right>
      <slot />

      <USeparator
        orientation="vertical"
        class="h-7"
      />

      <UColorModeButton size="sm" />
    </template>
  </UHeader>
</template>
