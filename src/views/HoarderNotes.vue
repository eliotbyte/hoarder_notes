<template>
  <div class="common-layout">
    <n-layout>
      <HoarderHeader />
      <n-layout-content class="layout-content">
        <n-row :gutter="30">
          <n-col :span="6">
            <div class="grid-content">
              <!-- Spaces and Topics List -->
              <div class="content-block">
                <div class="spaces-list">
                  <div
                    v-for="space in spaces"
                    :key="space.id"
                    class="space-item"
                  >
                    <div
                      @click="selectSpace(space)"
                      :class="{ selected: space.id === spaceId }"
                      class="space-name"
                    >
                      {{ space.name }}
                    </div>
                    <transition name="slide">
                      <div v-if="space.id === spaceId" class="topics-list">
                        <div
                          v-for="topic in space.topics"
                          :key="topic.id"
                          @click="selectTopic(space, topic)"
                          :class="{ selected: topic.id === topicId }"
                          class="topic-item"
                        >
                          {{ topic.name }}
                        </div>
                      </div>
                    </transition>
                  </div>
                </div>
              </div>
            </div>
          </n-col>
          <n-col :span="12">
            <NoteFeed
              :space-id="spaceId"
              :topic-id="topicId"
              :tags="filterTags"
              :not-reply="notReply"
              :show-create-note-item="spaceId && topicId"
              :date="date"
            />
          </n-col>
          <n-col :span="6">
            <div class="grid-content">
              <!-- Filters Block -->
              <div class="content-block">
                <div class="filters-list">
                  <div class="filters-header" @click="toggleFilters">
                    <span>Filters</span>
                    <n-icon
                      :style="{
                        transform: filtersExpanded
                          ? 'rotate(90deg)'
                          : 'rotate(0deg)',
                      }"
                      style="float: right"
                    >
                      <ChevronForward />
                    </n-icon>
                  </div>
                  <transition name="slide">
                    <div v-if="filtersExpanded" class="filters-content">
                      <!-- Tag Input -->
                      <TagInput v-model="filterTags" />
                      <!-- Not Reply Checkbox -->
                      <n-checkbox v-model="notReply">Not Reply</n-checkbox>
                      <!-- Apply Button -->
                      <div class="filter-apply-button">
                        <n-button
                          type="primary"
                          :disabled="!filtersChanged"
                          @click="applyFilters"
                        >
                          Apply
                        </n-button>
                      </div>
                    </div>
                  </transition>
                </div>
              </div>
            </div>
          </n-col>
        </n-row>
      </n-layout-content>
    </n-layout>
  </div>
</template>

<script>
import {
  NLayout,
  NLayoutContent,
  NRow,
  NCol,
  NCheckbox,
  NButton,
  NIcon,
} from 'naive-ui'
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import HoarderHeader from '@/components/HoarderHeader.vue'
import TagInput from '@/components/TagInput.vue'
import { ChevronForward } from '@vicons/ionicons5'
import api from '@/utils/api.js'
import NoteFeed from '@/components/NoteFeed.vue'

export default {
  name: 'HoarderNotes',
  components: {
    NLayout,
    NLayoutContent,
    NRow,
    NCol,
    NCheckbox,
    NButton,
    NIcon,
    HoarderHeader,
    TagInput,
    ChevronForward,
    NoteFeed,
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const date = ref(new Date().toISOString().split('.')[0] + 'Z')
    const topicId = ref(null)
    const spaceId = ref(null)
    const spaces = ref([])

    const filtersExpanded = ref(false)
    const filterTags = ref([])
    const notReply = ref(false)
    const initialFilterTags = ref([])
    const initialNotReply = ref(false)

    const filtersChanged = computed(() => {
      return (
        JSON.stringify(filterTags.value) !==
          JSON.stringify(initialFilterTags.value) ||
        notReply.value !== initialNotReply.value
      )
    })

    const toggleFilters = () => {
      filtersExpanded.value = !filtersExpanded.value
    }

    const applyFilters = () => {
      // Update query parameters
      const query = {
        ...route.query,
        tags:
          filterTags.value.length > 0 ? filterTags.value.join(',') : undefined,
        notReply: notReply.value ? 'true' : undefined,
        date: new Date().toISOString().split('.')[0] + 'Z',
      }

      // Remove undefined keys
      Object.keys(query).forEach(
        (key) => query[key] === undefined && delete query[key]
      )

      router.replace({ query })

      // Update initial values
      initialFilterTags.value = [...filterTags.value]
      initialNotReply.value = notReply.value
    }

    const loadSpaces = async () => {
      try {
        const response = await api.get('/spaces')
        spaces.value = response.data

        // After spaces are loaded, check if route.query.spaceId and topicId are set
        if (route.query.spaceId) {
          const space = spaces.value.find((s) => s.id == route.query.spaceId)
          if (space) {
            spaceId.value = space.id
            if (route.query.topicId) {
              const topic = space.topics.find(
                (t) => t.id == route.query.topicId
              )
              if (topic) {
                topicId.value = topic.id
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading spaces:', error)
      }
    }

    const selectSpace = (space) => {
      spaceId.value = space.id
      topicId.value = null
    }

    const selectTopic = (space, topic) => {
      spaceId.value = space.id
      topicId.value = topic.id
    }

    onMounted(() => {
      loadSpaces()

      // Set filters from query parameters
      if (route.query.tags) {
        filterTags.value = route.query.tags.split(',')
        initialFilterTags.value = [...filterTags.value]
      }
      if (route.query.notReply) {
        notReply.value = route.query.notReply === 'true'
        initialNotReply.value = notReply.value
      }
      if (route.query.date) {
        date.value = route.query.date
      }
      // Expand filters if any filter is set
      if (route.query.tags || route.query.notReply) {
        filtersExpanded.value = true
      }
    })

    watch([spaceId, topicId], ([newSpaceId, newTopicId]) => {
      // Update the route query parameters
      router.replace({
        query: {
          ...route.query,
          spaceId: newSpaceId,
          topicId: newTopicId,
        },
      })
    })

    return {
      spaces,
      spaceId,
      topicId,
      selectSpace,
      selectTopic,
      filtersExpanded,
      toggleFilters,
      filterTags,
      notReply,
      applyFilters,
      filtersChanged,
      ChevronForward,
      date,
    }
  },
}
</script>

<style scoped>
.common-layout {
  width: 1169px;
  margin: 0 auto;
  position: relative;
  top: 0;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.layout-content {
  padding-top: 80px;
}

.n-icon {
  font-size: 24px;
  color: var(--text-color);
}

.grid-content {
  padding: 16px;
}

.spaces-list {
  position: sticky;
  top: 0;
  max-height: calc(100vh - 80px);
  overflow-y: auto;
}

.space-item {
  margin-bottom: 8px;
}

.space-name {
  padding: 8px;
  cursor: pointer;
  font-weight: bold;
}

.topics-list {
  margin-left: 16px;
  overflow: hidden;
}

.topic-item {
  padding: 6px 8px;
  cursor: pointer;
}

.selected {
  background-color: var(--selected-bg-color);
  border-radius: 4px;
}

/* Transition styles for topics-list */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.5s ease;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}

.slide-enter-to,
.slide-leave-from {
  max-height: 500px; /* Adjust as needed */
  opacity: 1;
}

.filters-list {
  position: sticky;
  top: 0;
  max-height: calc(100vh - 80px);
  overflow-y: auto;
}

.filters-header {
  padding: 8px;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filters-content {
  margin-left: 16px;
  overflow: hidden;
}

.filter-apply-button {
  margin-top: 10px;
}
</style>
