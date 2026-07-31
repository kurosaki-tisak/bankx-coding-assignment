Pod::Spec.new do |s|
  s.name           = 'AesCrypto'
  s.version        = '1.0.0'
  s.summary        = 'Native AES-128-ECB decryption for KakaoBankApp'
  s.description    = 'Decrypts account numbers with iOS CommonCrypto AES-128-ECB'
  s.author         = 'KakaoBankApp'
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = {
    :ios => '16.4',
    :tvos => '16.4'
  }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
