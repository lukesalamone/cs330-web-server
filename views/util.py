from flask import Response, request
from flask_restful import Resource
from mongoengine import DoesNotExist, Q
from flask import current_app
import models
import json

class DebugEndpoint(Resource):
    def get(self):

        return Response(json.dumps(current_app.config['MONGODB_SETTINGS']), mimetype="application/json", status=200)

def initialize_routes(api):
    api.add_resource(DebugEndpoint, '/api/debug', '/api/debug/')
