class CreateResponse:
    @staticmethod
    def create_user_response(user, token_data=None, access_token=None):
        response_data = {
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'second_name': user.last_name,
        }

        if token_data:
            # Handle both dictionary and RefreshToken object
            if hasattr(token_data, 'access_token'):  # It's a RefreshToken object
                response_data['access'] = str(token_data.access_token)
                response_data['refresh'] = str(token_data)
            elif isinstance(token_data, dict):  # It's a dictionary
                response_data.update(token_data)
        
        if access_token:
            response_data['access'] = str(access_token)
            
        return response_data