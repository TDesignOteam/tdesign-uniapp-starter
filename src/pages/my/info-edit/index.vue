<template>
  <t-navbar left-arrow title="个人信息" placeholder />
  <view class="info-edit">
    <t-cell t-class="info-edit__cell" title="用户名">
      <template #note>
        <t-input borderless placeholder="请输入用户名" v-model:value="personInfo.name" @change="onNameChange" />
      </template>
    </t-cell>
    <t-cell t-class="info-edit__cell" title="性别">
      <template #note>
        <t-radio-group
          borderless
          :default-value="personInfo.gender"
          :options="genderOptions"
          :value="personInfo.gender"
          t-class="info-edit__gender"
          @change="onGenderChange"
        />
      </template>
    </t-cell>
    <t-cell arrow :note="personInfo.birth || ''" title="生日" @click="showPicker('birth')" />
    <t-cell arrow :note="addressText || ''" title="地址" @click="showPicker('address')" />
    <t-cell t-class="info-edit__cell" title="个人简介">
      <template #note>
        <t-textarea
          :disable-default-padding="true"
          indicator
          :maxcharacter="50"
          placeholder="请输入个人简介"
          t-class="info-edit__introduction"
          :value="personInfo.introduction"
          @blur="onIntroductionChange"
        />
      </template>
    </t-cell>
    <t-cell :bordered="false" t-class="info-edit__cell" title="相片墙">
      <template #note>
        <t-upload
          draggable
          :files="personInfo.photos"
          :grid-config="gridConfig"
          :media-type="['image']"
          t-class="info-edit__photos"
          @drop="onPhotosDrop"
          @remove="onPhotosRemove"
          @success="onPhotosSuccess"
        />
      </template>
    </t-cell>
  </view>

  <view class="info-edit__save">
    <t-button block size="medium" theme="primary" @click="onSaveInfo">保存</t-button>
  </view>

  <t-date-time-picker
    auto-close
    cancel-btn="取消"
    confirm-btn="确认"
    :default-value="personInfo.birth"
    :end="birthEnd"
    format="YYYY-MM-DD"
    mode="date"
    :start="birthStart"
    title="选择生日"
    :value="personInfo.birth"
    :visible="birthVisible"
    @cancel="hidePicker('birth')"
    @change="onBirthChange"
  />

  <t-picker
    cancel-btn="取消"
    confirm-btn="确认"
    title="选择地址"
    :value="personInfo.address"
    :visible="addressVisible"
    @cancel="hidePicker('address')"
    @change="onAddressChange"
    @close="hidePicker('address')"
    @pick="onAreaPick"
  >
    <t-picker-item :options="provinces" />
    <t-picker-item :options="cities" />
  </t-picker>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import request from '@/api/request';
import { areaList } from './areaData';

interface PersonInfo {
  name: string;
  gender: number;
  birth: string;
  address: string[];
  introduction: string;
  photos: { url: string; name: string; type: string }[];
}

interface Option {
  value: string;
  label: string;
}

const personInfo = reactive<PersonInfo>({
  name: '',
  gender: 0,
  birth: '',
  address: [],
  introduction: '',
  photos: [],
});

const genderOptions = ref([
  { label: '男', value: 0 },
  { label: '女', value: 1 },
  { label: '保密', value: 2 },
]);

const birthVisible = ref(false);
const birthStart = '1970-01-01';
const birthEnd = '2025-03-01';
const addressText = ref('');
const addressVisible = ref(false);
const provinces = ref<Option[]>([]);
const cities = ref<Option[]>([]);

const gridConfig = ref({
  column: 3,
  width: 160,
  height: 160,
});

const getAreaOptions = (data: Record<string, string>, filter?: (item: Option) => boolean): Option[] => {
  const res = Object.keys(data).map((key) => ({ value: key, label: data[key] }));
  return typeof filter === 'function' ? res.filter(filter) : res;
};

const getCities = (provinceValue: string) => {
  return getAreaOptions(
    areaList.cities,
    (city) => city.value.slice(0, 2) === provinceValue.slice(0, 2)
  );
};

const initAreaData = () => {
  provinces.value = getAreaOptions(areaList.provinces);
  cities.value = getCities(provinces.value[0].value);
};

const getPersonalInfo = async () => {
  const res: any = await request('/api/genPersonalInfo');
  Object.assign(personInfo, res.data);
  addressText.value = `${areaList.provinces[personInfo.address[0] as keyof typeof areaList.provinces]} ${areaList.cities[personInfo.address[1] as keyof typeof areaList.cities]}`;
};

const onAreaPick = (e: any) => {
  const { column, index } = e || e;
  if (column === 0) {
    cities.value = getCities(provinces.value[index].value);
  }
};

const showPicker = (mode: string) => {
  if (mode === 'birth') {
    birthVisible.value = true;
  } else if (mode === 'address') {
    addressVisible.value = true;
    cities.value = getCities(personInfo.address[0]);
  }
};

const hidePicker = (mode: string) => {
  if (mode === 'birth') {
    birthVisible.value = false;
  } else if (mode === 'address') {
    addressVisible.value = false;
  }
};

const onBirthChange = (e: any) => {
  const { value } = e || e;
  personInfo.birth = value;
};

const onAddressChange = (e: any) => {
  const { value, label } = e || e;
  personInfo.address = value;
  addressText.value = label.join(' ');
};

const onNameChange = (e: any) => {
  personInfo.name = e?.value || e.value;
};

const onGenderChange = (e: any) => {
  personInfo.gender = e?.value || e.value;
};

const onIntroductionChange = (e: any) => {
  personInfo.introduction = e?.value || e.value;
};

const onPhotosRemove = (e: any) => {
  const { index } = e || e;
  personInfo.photos.splice(index, 1);
};

const onPhotosSuccess = (e: any) => {
  const { files } = e || e;
  personInfo.photos = files;
};

const onPhotosDrop = (e: any) => {
  const { files } = e || e;
  personInfo.photos = files;
};

const onSaveInfo = () => {
  console.log('保存信息:', personInfo);
  uni.showToast({ title: '保存成功', icon: 'success' });
};

onMounted(() => {
  initAreaData();
  getPersonalInfo();
});
</script>

<style lang="less" scoped>
page {
  background-color: #fff;
}

.info-edit {
  --td-input-vertical-padding: 0;

  :deep(.info-edit__cell) {
    .t-cell__title {
      flex: none;
      width: 162rpx;
    }
  }

  :deep(.info-edit__gender) {
    --td-radio-vertical-padding: 0;
    width: 100%;
    display: flex;
    justify-content: space-between;
  }

  :deep(.info-edit__introduction) {
    width: 100%;
    padding: 0 !important;
    height: 200rpx;
  }

  :deep(.info-edit__photos) {
    width: 100%;
  }
}


.info-edit__save {
  position: fixed;
  left: 32rpx;
  right: 32rpx;
  bottom: calc(env(safe-area-inset-bottom) + 32rpx);
}


</style>
