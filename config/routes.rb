Rails.application.routes.draw do
  root 'pages#home'
  get 'issues', to: 'pages#issues'
end
