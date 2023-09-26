# coding: utf-8

"""
    Devbook

    Devbook API

    The version of the OpenAPI document: 1.0.0
    Generated by OpenAPI Generator (https://openapi-generator.tech)

    Do not edit the class manually.
"""  # noqa: E501


from __future__ import annotations
import pprint
import re  # noqa: F401
import json


from pydantic import BaseModel, Field, StrictInt, StrictStr


class Error(BaseModel):
    """
    Error
    """

    code: StrictInt = Field(..., description="Error code")
    message: StrictStr = Field(..., description="Error")

    """Pydantic configuration"""
    model_config = {
        "populate_by_name": True,
        "validate_assignment": True,
    }

    def to_str(self) -> str:
        """Returns the string representation of the model using alias"""
        return pprint.pformat(self.model_dump(by_alias=True))

    def to_json(self) -> str:
        """Returns the JSON representation of the model using alias"""
        return json.dumps(self.to_dict())

    @classmethod
    def from_json(cls, json_str: str) -> Error:
        """Create an instance of Error from a JSON string"""
        return cls.from_dict(json.loads(json_str))

    def to_dict(self):
        """Returns the dictionary representation of the model using alias"""
        _dict = self.model_dump(by_alias=True, exclude={}, exclude_none=True)
        return _dict

    @classmethod
    def from_dict(cls, obj: dict) -> Error:
        """Create an instance of Error from a dict"""
        if obj is None:
            return None

        if not isinstance(obj, dict):
            return Error.model_validate(obj)

        # raise errors for additional fields in the input
        for _key in obj.keys():
            if _key not in ["code", "message"]:
                raise ValueError(
                    "Error due to additional fields (not defined in Error) in the input: "
                    + obj
                )

        _obj = Error.model_validate(
            {"code": obj.get("code"), "message": obj.get("message")}
        )
        return _obj
